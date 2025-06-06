import { getUsuarios } from '../../../../services/usuarioService';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const usuarios = await getUsuarios();
            res.status(200).json({ success: true, data: usuarios });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Método no permitido' });
    }
}