import { S3Service } from "src/s3/s3.service";

export default async function saveManifest(file: Buffer, name: string, mimetype: string) {
    const s3 = new S3Service();
    const setor = 'intelesign-manifest';
    const newName = `${Date.now()}.${name.split('.').pop()}`;
    await s3.uploadFile(setor, newName, mimetype, file);

    return {
        url_view: `${process.env.LOCAL_URL}/file/${setor}/${newName}`,
        url_download: `${process.env.LOCAL_URL}/file/download/${setor}/${newName}`,
        name,
        size: file.length,
        mimetype,
        setor,
        new_name: newName,
    };
}