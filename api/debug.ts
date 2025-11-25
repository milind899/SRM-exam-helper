export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).json({
        hasDatabase: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
    });
}
