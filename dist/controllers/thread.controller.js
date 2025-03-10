"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllThread = getAllThread;
exports.createThread = createThread;
exports.updateThread = updateThread;
exports.deleteThread = deleteThread;
exports.getThreadDetail = getThreadDetail;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getAllThread(req, res) {
    try {
        // Ambil userId dari middleware authentication
        const userId = req.user?.id;
        const filterByUser = req.query.filterByUser === 'true';
        const userIdOther = req.query.userId
            ? parseInt(req.query.userId, 10)
            : null;
        // Validasi userId
        if (!userId) {
            return res.status(400).json({ message: 'Invalid or missing userId' });
        }
        // Ambil daftar following ID
        const following = await prisma.follow.findMany({
            where: { followingId: userId },
            select: { followerId: true },
        });
        console.log("Following IDs:", following);
        const followingIds = following.map((follow) => follow.followerId);
        console.log("Mapped Following IDs:", followingIds);
        const allAuthorIds = [...followingIds, userId];
        if (allAuthorIds.length === 0) {
            return res.status(200).json({
                message: 'No threads found',
                threads: [],
            });
        }
        const threads = await prisma.thread.findMany({
            where: {
                isDeleted: 0,
                authorId: { in: allAuthorIds },
                ...(filterByUser && userIdOther && { authorId: userIdOther }),
            },
            include: {
                profile: { select: { id: true, fullname: true, profileImage: true } },
                author: { select: { id: true, username: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({
            message: 'Get threads successfully',
            threads,
        });
    }
    catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).json({ message: 'Error fetching threads', error });
    }
}
async function createThread(req, res) {
    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim() === '') {
        return res
            .status(400)
            .json({ message: 'Content must be a non-empty string' });
    }
    try {
        const { id: authorId } = req.user;
        const user = await prisma.user.findUnique({
            where: { id: authorId },
            include: { profile: true },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const profile = user.profile && user.profile[0];
        if (!profile) {
            return res.status(400).json({ message: 'User does not have a profile' });
        }
        const file = req.file?.path || null;
        const newThread = await prisma.thread.create({
            data: {
                content,
                authorId,
                profileId: profile.id,
                image: file,
            },
        });
        const threadWithDetails = await prisma.thread.findUnique({
            where: { id: newThread.id },
            include: {
                author: true,
                profile: true,
            },
        });
        return res.status(201).json({
            message: 'Thread created successfully',
            thread: threadWithDetails,
        });
    }
    catch (error) {
        console.error('Error creating thread:', error);
        return res.status(500).json({ message: 'Error creating thread', error });
    }
}
async function updateThread(req, res) {
    const threadId = parseInt(req.params.id);
    const { content } = req.body;
    const file = req.file?.path;
    if (!content && !file) {
        return res.status(400).json({ message: 'Nothing to update' });
    }
    try {
        const existingThread = await prisma.thread.findUnique({
            where: { id: threadId },
        });
        if (!existingThread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        if (existingThread.authorId !== req.user.id) {
            return res
                .status(403)
                .json({ message: 'You are not authorized to update this thread' });
        }
        const updatedThread = await prisma.thread.update({
            where: { id: threadId },
            data: {
                ...(content && { content }),
                ...(file && { image: file }),
            },
            include: {
                profile: true, // Tambahkan profil
                author: true, // Tambahkan penulis
            },
        });
        res
            .status(200)
            .json({ message: 'Successfully updated thread', thread: updatedThread });
    }
    catch (error) {
        console.error('Error updating thread:', error);
        res.status(500).json({ message: 'Failed to update thread', error });
    }
}
async function deleteThread(req, res) {
    const threadId = parseInt(req.params.id);
    try {
        const threadExist = await prisma.thread.findUnique({
            where: { id: threadId },
        });
        if (!threadExist) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        if (threadExist.authorId !== req.user.id) {
            return res
                .status(403)
                .json({ message: 'You are not authorized to delete this thread' });
        }
        if (threadExist.isDeleted === 1) {
            return res.status(400).json({ message: 'Thread is already deleted' });
        }
        await prisma.thread.update({
            where: { id: threadId },
            data: { isDeleted: 1 },
        });
        res.status(200).json({ message: 'Thread deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ message: 'Error deleting thread', error });
    }
}
async function getThreadDetail(req, res) {
    const threadId = parseInt(req.params.id);
    if (isNaN(threadId)) {
        return res.status(400).json({ message: 'Invalid thread ID' });
    }
    try {
        const thread = await prisma.thread.findUnique({
            where: { id: threadId, isDeleted: 0 },
            include: {
                profile: { select: { id: true, fullname: true, profileImage: true } },
                author: { select: { id: true, username: true } },
            },
        });
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        res.status(200).json({ message: 'Get thread detail successfully', thread });
    }
    catch (error) {
        console.error('Error fetching thread detail:', error);
        res.status(500).json({ message: 'Error fetching thread detail', error });
    }
}
