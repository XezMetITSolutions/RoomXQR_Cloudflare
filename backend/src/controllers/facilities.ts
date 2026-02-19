import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getTenantId } from '../middleware/tenant';

const prisma = new PrismaClient();

export const getFacilities = async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        if (!tenantId) {
            return res.status(403).json({ error: 'Tenant context required' });
        }

        const facilities = await prisma.hotelFacility.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(facilities);
    } catch (error) {
        console.error('Error fetching facilities:', error);
        return res.status(500).json({ error: 'Failed to fetch facilities' });
    }
};

export const createFacility = async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        if (!tenantId) {
            return res.status(403).json({ error: 'Tenant context required' });
        }

        const { name, description, image, location, openingHours, reservationInfo, contactInfo, isActive, translations, hotelId } = req.body;

        // Use derived hotelId if not provided (assume first hotel of tenant)
        let finalHotelId = hotelId;
        if (!finalHotelId) {
            const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
            finalHotelId = hotel?.id;
        }

        if (!finalHotelId) {
            return res.status(400).json({ error: 'Hotel context not found' });
        }

        const facility = await prisma.hotelFacility.create({
            data: {
                name,
                description,
                image,
                location,
                openingHours,
                reservationInfo,
                contactInfo,
                isActive: isActive !== undefined ? isActive : true,
                translations: translations || {},
                tenantId,
                hotelId: finalHotelId
            }
        });

        return res.status(201).json(facility);
    } catch (error) {
        console.error('Error creating facility:', error);
        return res.status(500).json({ error: 'Failed to create facility' });
    }
};

export const updateFacility = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tenantId = getTenantId(req);
        if (!tenantId) {
            return res.status(403).json({ error: 'Tenant context required' });
        }

        const { name, description, image, location, openingHours, reservationInfo, contactInfo, isActive, translations } = req.body;

        const facility = await prisma.hotelFacility.update({
            where: { id, tenantId },
            data: {
                name,
                description,
                image,
                location,
                openingHours,
                reservationInfo,
                contactInfo,
                isActive,
                translations
            }
        });

        return res.json(facility);
    } catch (error) {
        console.error('Error updating facility:', error);
        return res.status(500).json({ error: 'Failed to update facility' });
    }
};

export const deleteFacility = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tenantId = getTenantId(req);
        if (!tenantId) {
            return res.status(403).json({ error: 'Tenant context required' });
        }

        await prisma.hotelFacility.delete({
            where: { id, tenantId }
        });

        return res.status(204).end();
    } catch (error) {
        console.error('Error deleting facility:', error);
        return res.status(500).json({ error: 'Failed to delete facility' });
    }
};
