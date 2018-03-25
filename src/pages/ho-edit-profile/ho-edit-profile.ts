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
  selector: 'page-ho-edit-profile',
  templateUrl: 'ho-edit-profile.html',
})
export class HoEditProfilePage {
  profileData:any;
  userForm:FormGroup;
  public imgName;
  public imgUrl;
  public gender;
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
      this.userForm = this.fb.group({
        'fname':[null,Validators.compose([Validators.required, Validators.minLength(2)])],
        'lname':[null,Validators.compose([Validators.required, Validators.minLength(2)])],
        'email':[null,Validators.compose([Validators.required, Validators.email])],
        // 'password':[null,Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(30)])],
       'mobile':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11)])],
       'gender':[this.gender, Validators.required],
       // 'gender':[null,Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(11)])],
     });
  }

  ionViewDidLoad() {
    this.afs.authState.take(1).subscribe( auth => {
      this.afdb.object(`/profile/${auth.uid}`).valueChanges().subscribe( data => {
        this.profileData = data;
        this.gender = this.profileData.gender;

        this.retrieveImg();
      });
    });
  }

  retrieveImg() {
    this.userId = this.authProvider.setID();
    try{
      firebase.storage().ref().child("images/" + this.userId + "/" + this.profileData.profPic).getDownloadURL().then(d=>{
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

  async upload(buffer, name) {
    let blob = new Blob([buffer], { type: 'image/jpeg' });

    let storageHere = firebase.storage();

    storageHere.ref('images/' + this.userId + "/" + name).put(blob).catch((error)=>{
      alert("error" + JSON.stringify(error));
    })
  }

  editProfile() {
    this.afs.authState.take(1).subscribe( auth => {
      this.afdb.object(`/profile/${auth.uid}`).update(this.userForm.value).then(d => {
        this.afdb.object(`/profile/${auth.uid}`).update({profPic: this.imgUrl.name})
        this.file.readAsArrayBuffer(this.imgPath, this.imgUrl.name).then(async (buffer)=>{
          await this.upload(buffer, this.imgUrl.name);
        })
      })
    });
    this.navCtrl.pop();
  }
}
