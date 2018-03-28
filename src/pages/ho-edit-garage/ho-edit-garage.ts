import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase';

import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';

import 'rxjs/add/operator/take';

/**
 * Generated class for the HoEditProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ho-edit-garage',
  templateUrl: 'ho-edit-garage.html',
})
export class HoEditGaragePage {
  userData:any;
  garageForm:FormGroup;
  public imgName;
  public imgUrl;
  private imgPath;
  private userId;
  profile$: AngularFireObject<any>;

  constructor(private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private authProvider: AuthProvider,
    // public loadingCtrl: LoadingController, 
    private fb:FormBuilder,
    private fileChooser: FileChooser,
		private file: File,
		private filePath: FilePath) {
      this.garageForm = this.fb.group({
        'address':[null,Validators.compose([Validators.required, Validators.minLength(10)])],
        'capacity':[null,Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(4)])],
        'details':['']
     });
  }

  ionViewDidLoad() {
    this.afs.authState.take(1).subscribe( auth => {
      this.afdb.object(`/profile/${auth.uid}`).valueChanges().subscribe( data => {
        this.userData = data;

        this.retrieveImg();
      });
    });
  }

  retrieveImg() {
    this.userId = this.authProvider.setID();
    try{
      firebase.storage().ref().child("images/" + this.userId + "/" + this.userData.garagePic).getDownloadURL().then(d=>{
        this.imgName = d;
      });
    }
    catch(e){
      console.log(e);
    }   
  }

  changeImg() {
    this.fileChooser.open().then((url)=>{
      this.filePath.resolveNativePath(url).then((path)=>{
      
      this.file.resolveLocalFilesystemUrl(path).then((newUrl)=>{
        this.imgUrl = newUrl;

        let dirPath = newUrl.nativeURL;
        this.imgName = dirPath;
        let dirPathSegments = dirPath.split('/'); //break string to array
        dirPathSegments.pop();  //remove last element
        dirPath = dirPathSegments.join('/');
        this.imgPath = dirPath;          
        
      }).catch((e)=>{
        alert("error " + JSON.stringify(e));
      })
    })
  })
  }

  upload(path, name) {
    this.file.readAsArrayBuffer(path, name).then((buffer)=>{
      let blob = new Blob([buffer], { type: 'image/jpeg' });
      let storageHere = firebase.storage();

      storageHere.ref('images/' + this.userId + "/" + name).put(blob).catch((error)=>{
        alert("error: " + JSON.stringify(error, Object.getOwnPropertyNames(error)));
      })
    })
    
  }

  updateGarage() {
    this.afs.authState.take(1).subscribe( auth => {
      this.afdb.object(`/profile/${auth.uid}`).update(this.garageForm.value).then(d => {
        this.afdb.object(`/profile/${auth.uid}`).update({garagePic: this.imgUrl.name})
        this.upload(this.imgPath, this.imgUrl.name);
        // this.file.readAsArrayBuffer(this.imgPath, this.imgUrl.name).then(async (buffer)=>{
        //   await this.upload(buffer, this.imgUrl.name);
        // }).catch((error)=>{
        //   alert("error: " + JSON.stringify(error, Object.getOwnPropertyNames(error)));
        // })
      })
    })
    this.navCtrl.pop();
  }
}
