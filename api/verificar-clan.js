export default async function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { id } = req.query;
    const BOT_TOKEN = process.env.BOT_TOKEN; // Token nas variáveis de ambiente
    const GUILD_ID = '1332289203127582780';
    
    if (!id || !BOT_TOKEN) {
        return res.status(400).json({ erro: 'Parâmetros faltando' });
    }
    
    try {
        // Buscar membro
        const memberRes = await fetch(
            `https://discord.com/api/guilds/${GUILD_ID}/members/${id}`,
            { headers: { 'Authorization': `Bot ${BOT_TOKEN}` } }
        );
        
        if (!memberRes.ok) {
            return res.status(200).json({ clan: null });
        }
        
        const memberData = await memberRes.json();
        
        // Buscar cargos
        const rolesRes = await fetch(
            `https://discord.com/api/guilds/${GUILD_ID}/roles`,
            { headers: { 'Authorization': `Bot ${BOT_TOKEN}` } }
        );
        const rolesData = await rolesRes.json();
        
        // Procurar clan
        let clan = null;
        if (memberData.roles) {
            for (const roleId of memberData.roles) {
                const role = rolesData.find(r => r.id === roleId);
                if (role && role.name.startsWith('・ ')) {
                    clan = role.name.replace('・ ', '');
                    break;
                }
            }
        }
        
        return res.status(200).json({ clan });
        
    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
}
