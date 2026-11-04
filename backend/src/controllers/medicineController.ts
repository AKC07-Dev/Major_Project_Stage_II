import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export async function getMedicines(req: Request, res: Response) {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ medicines });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch medicines.' });
  }
}

export async function createMedicine(req: Request, res: Response) {
  try {
    const { name, dosage, instructions, boxNumber, active } = req.body;

    if (!name || !boxNumber) {
      return res.status(400).json({ error: 'Medicine name and box number are required.' });
    }

    if (boxNumber !== 1 && boxNumber !== 2) {
      return res.status(400).json({ error: 'Invalid box number. Box number must be 1 or 2.' });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        dosage: dosage || null,
        instructions: instructions || null,
        boxNumber: Number(boxNumber),
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return res.status(201).json({ medicine });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create medicine entry.' });
  }
}

export async function updateMedicine(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { name, dosage, instructions, boxNumber, active } = req.body;

    const existing = await prisma.medicine.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Medicine record not found.' });
    }

    const updated = await prisma.medicine.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(dosage !== undefined && { dosage }),
        ...(instructions !== undefined && { instructions }),
        ...(boxNumber && { boxNumber: Number(boxNumber) }),
        ...(active !== undefined && { active: Boolean(active) }),
      },
    });

    return res.json({ medicine: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update medicine record.' });
  }
}

export async function deleteMedicine(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.medicine.delete({ where: { id } });
    return res.json({ message: 'Medicine deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete medicine.' });
  }
}
