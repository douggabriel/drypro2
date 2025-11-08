import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create upload directories
const uploadDirs = ['uploads/photos', 'uploads/audio'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith('image/') ? 'photos' : 'audio';
    cb(null, `uploads/${folder}/`);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|ogg|m4a|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('webm');

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Authentication middleware
interface AuthRequest extends express.Request {
  user?: any;
}

const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }

    next();
  };
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'TRADE_WORKER',
        phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ==================== USER ROUTES ====================

app.get('/api/users', authenticateToken, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch('/api/users/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone, avatar },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==================== SITE ROUTES ====================

app.get('/api/sites', authenticateToken, async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

app.post('/api/sites', authenticateToken, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const site = await prisma.site.create({
      data: req.body
    });

    res.status(201).json(site);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// ==================== ACTIVITY ROUTES ====================

app.get('/api/activities', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const whereClause: any = {};

    // Filter by role
    if (req.user.role === 'TRADE_WORKER') {
      whereClause.workers = {
        some: { workerId: req.user.id }
      };
    } else if (req.user.role === 'SUPERVISOR') {
      whereClause.supervisorId = req.user.id;
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        site: true,
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        workers: {
          include: {
            worker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        phases: {
          include: {
            photos: true,
            audioNotes: true,
            completedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { phaseNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(activities);
  } catch (error) {
    console.error('Fetch activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

app.get('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        site: true,
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        workers: {
          include: {
            worker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        phases: {
          include: {
            photos: true,
            audioNotes: true,
            completedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { phaseNumber: 'asc' }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

app.post('/api/activities', authenticateToken, authorize('ADMIN', 'SUPERVISOR'), async (req: AuthRequest, res) => {
  try {
    const { type, siteId, building, floor, unit, area, priority, deadline, notes, workerIds } = req.body;

    const activity = await prisma.activity.create({
      data: {
        type,
        siteId,
        building,
        floor,
        unit,
        area,
        supervisorId: req.user.id,
        priority: priority || 'NORMAL',
        status: 'PENDING',
        deadline: deadline ? new Date(deadline) : null,
        notes,
        workers: workerIds ? {
          create: workerIds.map((workerId: string) => ({
            workerId
          }))
        } : undefined,
        phases: {
          create: [
            { phaseNumber: 1, phaseName: 'PLASTERBOARD_FIXING', percentage: 0, status: 'PENDING' },
            { phaseNumber: 2, phaseName: 'TAPING', percentage: 0, status: 'PENDING' },
            { phaseNumber: 3, phaseName: 'SECOND_COAT', percentage: 0, status: 'PENDING' },
            { phaseNumber: 4, phaseName: 'TOP_COAT', percentage: 0, status: 'PENDING' },
            { phaseNumber: 5, phaseName: 'SANDING', percentage: 0, status: 'PENDING' }
          ]
        }
      },
      include: {
        site: true,
        supervisor: true,
        workers: {
          include: {
            worker: true
          }
        },
        phases: true
      }
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

app.patch('/api/activities/:id', authenticateToken, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// ==================== PHASE ROUTES ====================

app.patch('/api/phases/:id', authenticateToken, upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'audio', maxCount: 1 }
]), async (req: AuthRequest, res) => {
  try {
    const { percentage, status, notes } = req.body;

    // Get current phase data
    const currentPhase = await prisma.phase.findUnique({
      where: { id: req.params.id }
    });

    if (!currentPhase) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    // Save phase history for undo functionality
    await prisma.phaseHistory.create({
      data: {
        phaseId: currentPhase.id,
        previousPercentage: currentPhase.percentage,
        previousStatus: currentPhase.status,
        modifiedById: req.user.id,
        action: 'UPDATE'
      }
    });

    // Update phase
    const updateData: any = {};
    if (percentage !== undefined) updateData.percentage = parseInt(percentage);
    if (status) {
      updateData.status = status;
      if (status === 'IN_PROGRESS' && !currentPhase.startedAt) {
        updateData.startedAt = new Date();
      }
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
        updateData.completedById = req.user.id;
        updateData.percentage = 100;
      }
    }
    if (notes) updateData.notes = notes;

    const phase = await prisma.phase.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        photos: true,
        audioNotes: true,
        completedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.photos) {
      for (const photo of files.photos) {
        await prisma.photo.create({
          data: {
            phaseId: phase.id,
            filename: photo.filename,
            originalName: photo.originalname,
            path: photo.path,
            uploadedById: req.user.id
          }
        });
      }
    }

    if (files?.audio && files.audio[0]) {
      await prisma.audioNote.create({
        data: {
          phaseId: phase.id,
          filename: files.audio[0].filename,
          originalName: files.audio[0].originalname,
          path: files.audio[0].path,
          uploadedById: req.user.id
        }
      });
    }

    res.json(phase);
  } catch (error) {
    console.error('Update phase error:', error);
    res.status(500).json({ error: 'Failed to update phase' });
  }
});

app.post('/api/phases/:id/undo', authenticateToken, authorize('ADMIN', 'SUPERVISOR'), async (req: AuthRequest, res) => {
  try {
    const phaseId = req.params.id;

    // Get latest history entry
    const latestHistory = await prisma.phaseHistory.findFirst({
      where: { phaseId },
      orderBy: { modifiedAt: 'desc' }
    });

    if (!latestHistory) {
      return res.status(404).json({ error: 'No history found' });
    }

    // Restore previous state
    const phase = await prisma.phase.update({
      where: { id: phaseId },
      data: {
        percentage: latestHistory.previousPercentage || 0,
        status: latestHistory.previousStatus as any || 'PENDING',
        completedAt: null,
        completedById: null
      }
    });

    // Delete the history entry
    await prisma.phaseHistory.delete({
      where: { id: latestHistory.id }
    });

    res.json(phase);
  } catch (error) {
    console.error('Undo phase error:', error);
    res.status(500).json({ error: 'Failed to undo phase update' });
  }
});

// ==================== MATERIAL ROUTES ====================

app.get('/api/materials', authenticateToken, async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

app.post('/api/materials', authenticateToken, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
  try {
    const material = await prisma.material.create({
      data: req.body
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// ==================== MATERIAL REQUEST ROUTES ====================

app.get('/api/material-requests', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const whereClause: any = {};

    // Trade workers only see their own requests
    if (req.user.role === 'TRADE_WORKER') {
      whereClause.requestedById = req.user.id;
    }

    const requests = await prisma.materialRequest.findMany({
      where: whereClause,
      include: {
        material: true,
        requestedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        activity: {
          select: {
            id: true,
            unit: true,
            building: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { requestedAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Fetch requests error:', error);
    res.status(500).json({ error: 'Failed to fetch material requests' });
  }
});

app.post('/api/material-requests', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { materialId, activityId, quantity, unit, urgency, justification } = req.body;

    const request = await prisma.materialRequest.create({
      data: {
        requestedById: req.user.id,
        materialId,
        activityId,
        quantity,
        unit,
        urgency: urgency || 'NORMAL',
        justification,
        status: 'PENDING'
      },
      include: {
        material: true,
        requestedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create material request' });
  }
});

app.patch('/api/material-requests/:id/approve', authenticateToken, authorize('ADMIN', 'SUPERVISOR'), async (req: AuthRequest, res) => {
  try {
    const { approverNotes } = req.body;

    const request = await prisma.materialRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedById: req.user.id,
        respondedAt: new Date(),
        approverNotes
      },
      include: {
        material: true,
        requestedBy: true
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: request.requestedById,
        type: 'MATERIAL_REQUEST_APPROVED',
        title: 'Material Request Approved',
        message: `Your request for ${request.quantity} ${request.unit} of ${request.material.name} has been approved.`
      }
    });

    res.json(request);
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

app.patch('/api/material-requests/:id/reject', authenticateToken, authorize('ADMIN', 'SUPERVISOR'), async (req: AuthRequest, res) => {
  try {
    const { approverNotes } = req.body;

    const request = await prisma.materialRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        approvedById: req.user.id,
        respondedAt: new Date(),
        approverNotes
      },
      include: {
        material: true,
        requestedBy: true
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: request.requestedById,
        type: 'MATERIAL_REQUEST_REJECTED',
        title: 'Material Request Rejected',
        message: `Your request for ${request.quantity} ${request.unit} of ${request.material.name} has been rejected. ${approverNotes || ''}`
      }
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// ==================== NOTIFICATION ROUTES ====================

app.get('/api/notifications', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ==================== SYNC ROUTES ====================

app.post('/api/sync', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const updates = req.body.updates || [];
    const results = [];

    for (const update of updates) {
      try {
        const { entity, action, data } = update;

        switch (action) {
          case 'CREATE':
            await (prisma as any)[entity].create({ data });
            break;
          case 'UPDATE':
            await (prisma as any)[entity].update({
              where: { id: data.id },
              data
            });
            break;
          case 'DELETE':
            await (prisma as any)[entity].delete({
              where: { id: data.id }
            });
            break;
        }

        results.push({ success: true, update });
      } catch (error) {
        console.error('Sync error:', error);
        results.push({ success: false, update, error: 'Sync failed' });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Sync endpoint error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// ==================== DASHBOARD STATS ====================

app.get('/api/dashboard/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const whereClause: any = {};

    if (req.user.role === 'SUPERVISOR') {
      whereClause.supervisorId = req.user.id;
    } else if (req.user.role === 'TRADE_WORKER') {
      whereClause.workers = {
        some: { workerId: req.user.id }
      };
    }

    const [totalActivities, inProgress, completed, pending] = await Promise.all([
      prisma.activity.count({ where: whereClause }),
      prisma.activity.count({ where: { ...whereClause, status: 'IN_PROGRESS' } }),
      prisma.activity.count({ where: { ...whereClause, status: 'COMPLETED' } }),
      prisma.activity.count({ where: { ...whereClause, status: 'PENDING' } })
    ]);

    res.json({
      totalActivities,
      inProgress,
      completed,
      pending
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
