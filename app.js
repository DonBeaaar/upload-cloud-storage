
const express = require('express');
const app = express();
const Multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { join, resolve } = require('path');
const { format } = require('util');

const multer = Multer({ storage: Multer.memoryStorage() });

const storage = new Storage({
    keyFilename: join(__dirname, 'my-tst-app-3562-d8c5d967fd2c.json'),
    projectId: 'my-tst-app-3562'
});

const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET || 'my-tst-app-3562_bucket')

app.post('/upload', multer.array('file'), async (req, res) => {

    if (!req.files) { return res.send(false); };

    let result = await asyncForEach(req.files);
    
    console.log(result);

});


async function asyncForEach (files){
    let filesUploadArray = [];
    for (let i = 0; i < files.length; i++) { 
        let fileUpload = await upload(files[i]);
        filesUploadArray.push(fileUpload);
    };

    return filesUploadArray;
}


function upload(file) {

    return new Promise((resolve, reject) => {

        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream({ resumable: false });

        blobStream.on('error', (err) => { reject(err) });

        blobStream.on('finish', () => {
            const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
            resolve(publicUrl);
        });

        blobStream.end(file.buffer);

    });
};



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { console.log('Escuchando en el puerto', PORT); });


/*
    PASOS PARA SUBIR A STORAGE GOOGLE

    1. DESDE NODE
        INSTALAR MULTER O UPLOADER DE ARCHIVOS
        CONFIGURAR MULTER O UPLOADER DE ARCHIVOS
        ASEGURARSE DE QUE PUEDA RECIBIR UNO O MAS ARCHIVOS Y CONFIGURARLO

    2. CONEXIÓN CON STORAGE
        CREAR BUCKET EN EL PROYECTO
        CONFIGURAR PARA QUE SE PUEDA LEER Y ESCRIBIR
            gsutil defacl set public-read gs://my-tst-app-3562_bucket
        CONFIGURAR LAS CREDENCIALES DE LA API
        CUANDO SE CREA EL USUARIO, AGREGAR CLAVE Y DESCARGAR EL JSON
        COPIAR EL JSON EN EL PROYECTO
        INSTALAR DEPENDENCIAS DE CLOUD STORAGE
        IMPORTAR {Storage} DESDE LAS DEPENDENCIAS
        INSTANCIAR LA CLASE STORAGE CON SUS CONFIGURACIONES (SI ESTÁ EN UN SERVER EXTERNO)
            keyfilename: JSON de clave de usuario
            projectId
        CONFIGURAR EL BUCKET
            YA SEA DESDE EL APP.YAML (VARIABLE DE ENTORNO) O COMO STRING, PARA QUE FUNCIONE EN LOCAL
        CREAR APP.YAML
        CREAR VARIABLE BLOB (MANCHA)
            const blob = bucket.file(req.file.originalname)->Ese nombre lo obtiene multer
            ESTE ES EL NOMBRE QUE ESE LE PONDRÁ AL ARCHIVO
        SUBIR EL ARCHIVO AL STORAGE
            const blobStream = blob.createWriteStream({resumable: false});
        MANEJAR EXECEPCIONES
            blobStream.on('error', =>{manejar el error});
        MOSTRAR URL EXITOSA
            blobStream.on('finish',()=>{ `https://storage.googleapis.com/${bucket.name}/${blob.name}` })
        CERRAR LA CONEXIÓN
            blobStream.end(req.file.buffer);

*/