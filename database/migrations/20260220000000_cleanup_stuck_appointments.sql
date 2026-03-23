-- Clean up old stuck consultations
UPDATE appointments 
SET status = 'completada' 
WHERE status IN ('en_consulta', 'pendiente') 
AND fecha_hora < NOW() - INTERVAL '24 hours' 
AND medico_id = '0fe50cb2-42dd-40ff-959f-62e4732a42de';
