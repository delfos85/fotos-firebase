import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { FileItem } from '../models/file-item';
 
@Injectable({
    providedIn: 'root'
})
 
 
export class CargaImagenesService {
 
    private CARPETA_IMAGENES = 'img';
     private Carp : string;
    constructor(private db: AngularFirestore) { }
 
 
    cargarImagenesFirebase(imagenes: FileItem[], carpeta: string) {
        this.Carp = carpeta;
        this.CARPETA_IMAGENES = carpeta;
        const storageRef = firebase.storage().ref();
 
        for (const item of imagenes) {
 
            item.estaSubiendo = true;
            if (item.progreso >= 100) {
                continue;
            }
 
            const uploadTask: firebase.storage.UploadTask =
                storageRef.child(`${ this.CARPETA_IMAGENES }/${ item.nombreArchivo }`)
                    .put(item.archivo);
 
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                (snapshot: firebase.storage.UploadTaskSnapshot) =>
                    item.progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                (error) => console.error('Error al subir', error),
                () => {
                    console.log('Imagen cargada');
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        item.url = downloadURL;
                        console.log(`url: ${item.url} `);
                        item.estaSubiendo = false;
                        this.guardarImagen({
                            nombre: item.nombreArchivo,
                            url: item.url
                        });
                    });
                });
 
 
        }
 
    }


  private guardarImagen( imagen: { nombre: string, url: string } ) {

    this.db.collection(`${ this.CARPETA_IMAGENES }`)
            .add( imagen );
  }

}
