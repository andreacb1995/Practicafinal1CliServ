<?php

    // Desactivar la visualización de errores en producción
    ini_set('display_errors', 1); // Desactivar los errores visuales
    error_reporting(E_ALL); // Mantener el registro de errores

    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");  // Permitir GET, POST, DELETE y OPTIONS
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true"); // Permitir credenciales (cookies)
    header('Content-Type: application/json');

// Incluir el autoload de Composer (asegúrate de tener MongoDB instalado mediante Composer)
require 'vendor/autoload.php';

// Conectar a MongoDB
try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $database = $client->proyectofinal1; // Nombre de tu base de datos
    $collection = $database->alumnos; // Nombre de la colección
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// Verificar si es una solicitud GET (para obtener un alumno o todos los alumnos)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener el ID de la URL (si está presente)
    $alumnoId = isset($_GET['id']) ? $_GET['id'] : null;
    
    if ($alumnoId) {
        // Si el ID está presente, buscar el alumno por su ID
        try {
            // Convertir el ID a ObjectId
            $id = new MongoDB\BSON\ObjectId($alumnoId);
            
            // Buscar al alumno por su ID
            $alumno = $collection->findOne(['_id' => $id]);
            
            if ($alumno) {
                // Limpiar el ID que MongoDB agrega automáticamente (MongoDB añade un campo _id que es único)
                $alumno['_id'] = (string) $alumno['_id']; // Convertir ObjectId a string para que sea legible en JSON
                echo json_encode(['success' => true, 'alumno' => $alumno]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Alumno no encontrado']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener el alumno: ' . $e->getMessage()]);
        }
    } else {
        // Si no se proporciona el ID, obtener todos los alumnos
        try {
            // Obtener todos los alumnos de la colección
            $alumnos = $collection->find(); // Aquí puedes filtrar o limitar los resultados si es necesario

            // Convertir los resultados a un array
            $alumnosArray = iterator_to_array($alumnos);

            // Limpiar el ID que MongoDB agrega automáticamente (MongoDB añade un campo _id que es único)
            foreach ($alumnosArray as &$alumno) {
                $alumno['_id'] = (string) $alumno['_id']; // Convertir ObjectId a string para que sea legible en JSON
            }

            // Enviar los datos de todos los alumnos en formato JSON
            echo json_encode(['success' => true, 'data' => $alumnosArray]);

        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener los alumnos: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario en formato JSON (para agregar o editar)
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['nombre']) && isset($data['apellidos']) && isset($data['telefono']) && isset($data['dni'])) {

        // Preparar el documento con los datos del alumno
        $alumno = [
            'nombre' => $data['nombre'],
            'apellidos' => $data['apellidos'],
            'telefono' => $data['telefono'],
            'dni' => $data['dni'],
            'direccion' => $data['direccion'] ?? '',
            'email' => $data['email'] ?? '',
            'formacion' => $data['formacion'] ?? '',
            'titulo_asociado' => $data['titulo_asociado'] ?? '',
            'promocion' => $data['promocion'] ?? '',
            'cv' => $data['cv'] ?? '',
            'oferta' => $data['oferta'] ?? '',
            'trabajando' => $data['trabajando'] ?? '',
            'cursando_titulado' => $data['cursando_titulado'] ?? '',
            'titula' => $data['titula'] ?? '',
            'titulo_que_le_da_acceso' => $data['titulo_que_le_da_acceso'] ?? '',
            'foto' => $data['foto'] ?? ''
        ];

        // Si existe el ID del alumno (en caso de editar)
        if (isset($data['_id']) && !empty($data['_id'])) {
            try {
                // Convertir el ID de MongoDB a un tipo de dato ObjectId
                $id = new MongoDB\BSON\ObjectId($data['_id']);
                
                // Actualizar el alumno en la base de datos
                $result = $collection->updateOne(
                    ['_id' => $id], // Buscar por ID
                    ['$set' => $alumno] // Actualizar solo los campos nuevos
                );

                // Verificar si la actualización fue exitosa
                if ($result->getModifiedCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Alumno actualizado correctamente.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'No se encontró el alumno o no hubo cambios.']);
                }

            } catch (Exception $e) {
                // Capturar cualquier error y devolverlo en la respuesta
                echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
            }
        } else {
            // Si no se proporciona el _id, se trata de una nueva inserción
            try {
                // Insertar el alumno en la base de datos
                $result = $collection->insertOne($alumno);

                // Verificar si se insertó correctamente
                if ($result->getInsertedCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Alumno guardado correctamente.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error al guardar el alumno.']);
                }

            } catch (Exception $e) {
                // Capturar cualquier error y devolverlo en la respuesta
                echo json_encode(['success' => false, 'message' => 'Error al insertar: ' . $e->getMessage()]);
            }
        }
    } else {
        // Si faltan datos importantes, devolver un error
        echo json_encode(['success' => false, 'message' => 'Faltan datos en el formulario.']);
    }
}

// Verificar el método HTTP
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Obtener el ID de la URL
    $alumnoId = isset($_GET['id']) ? $_GET['id'] : null;

    if ($alumnoId) {
        try {
            // Convertir el ID a ObjectId
            $id = new MongoDB\BSON\ObjectId($alumnoId);

            // Eliminar el alumno
            $result = $collection->deleteOne(['_id' => $id]);

            if ($result->getDeletedCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Alumno eliminado correctamente.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el alumno.']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar el alumno: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'ID del alumno no proporcionado']);
    }
}
?>
