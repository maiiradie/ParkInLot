import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';

import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';

import firebase from 'firebase';

import 'rxjs/add/operator/take';

/**
 * Generated class for the CoEditProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-co-edit-profile',
  templateUrl: 'co-edit-profile.html',
})
export class CoEditProfilePage {
  profileData:any;
  userForm:FormGroup;
  public imgName;
  public imgUrl;
  private imgPath;
  private userId;
  public user;
  private oldEmail;
  profile$: AngularFireObject<any>;

  constructor(private afdb: AngularFireDatabase, 
  	private afs:AngularFireAuth,
    public navCtrl: NavController, 
    public nav: Nav,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    public loadingCtrl: LoadingController, 
    private fb:FormBuilder,
    private fileChooser: FileChooser,
	private file: File,
    private filePath: FilePath,
    private toastCtrl: ToastController) {
      this.userForm = this.fb.group({
        'fname':[null,Validators.compose([Validators.required, Validators.minLength(2)])],
        'lname':[null,Validators.compose([Validators.required, Validators.minLength(2)])],
        'email':[null,Validators.compose([Validators.required, Validators.email])],
        'password':[null,Validators.compose([Validators.minLength(6), Validators.maxLength(30)])],
        'mobile':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11)])]
      });
  }

  ionViewDidLoad() {
    this.userId = this.authProvider.setID();
    
    this.afdb.object(`/profile/` + this.userId).valueChanges().subscribe( data => {
      this.profileData = data;
      this.oldEmail = this.profileData.email;

      this.retrieveImg();
    });
  }

  retrieveImg() {
    firebase.storage().ref().child("images/" + this.userId + "/" + this.profileData.profPic).getDownloadURL().then(d=>{
      this.imgUrl = d;
    }).catch(e => {
      this.imgUrl = "./assets/imgs/avatar.jpg";
    })   
  }

  showToast() {
    let toast = this.toastCtrl.create({
      message: 'Profile updated successfully.',
      duration: 3000
    })
    toast.present();
  }

  showEmailToast() {
    let toast = this.toastCtrl.create({
      message: 'Cannot update email. Email already taken or used.',
      duration: 3000
    })
    toast.present();
  }

  changeImg() {
    this.fileChooser.open().then((url)=>{
      this.filePath.resolveNativePath(url).then((path)=>{
      
	      this.file.resolveLocalFilesystemUrl(path).then((newUrl)=>{
	        let dirPath = newUrl.nativeURL;
	        this.imgUrl = dirPath;
	        let dirPathSegments = dirPath.split('/'); //break string to array
	        this.imgName = dirPathSegments.pop();  //remove last element
	        dirPath = dirPathSegments.join('/');
	        this.imgPath = dirPath;          
	        
	      }).catch((error)=>{
	        console.log("error in resolving picture url: " + JSON.stringify(error));
	      })
      })
  	})
  }

  upload(path, name) {
    this.file.readAsArrayBuffer(path, name).then((buffer)=>{
      let blob = new Blob([buffer], { type: 'image/jpeg' });

      let storageHere = firebase.storage();

      storageHere.ref('images/' + this.userId + "/" + name).put(blob).catch((error)=>{
        console.log("error in upload picture: " + JSON.stringify(error));
      })
    }).catch((error)=>{
      console.log("error in buffer: " + JSON.stringify(error));
    })
  }

  // Update password
  updatePassword() {
    if (this.userForm.value['password'] != null) {
      this.user.updatePassword(this.userForm.value['password']);
    }
  }

  editProfile() {
    const loading = this.loadingCtrl.create({
      content:'Updating profile...'
    });
  
    loading.present(loading);

    this.user = firebase.auth().currentUser;
    // success = this.updateEmail();
    if (this.userForm.value['email'] != this.oldEmail) {
      this.user.updateEmail(this.userForm.value['email']).then(() => {
        this.updatePassword();
        
        // Update profile values
        this.afdb.object(`/profile/` + this.userId).update(this.userForm.value).then(d => {
          // Update profile picture
          if (this.imgName != undefined) {
            this.afdb.object(`/profile/` + this.userId).update({profPic: this.imgName}).then(() => {
              this.upload(this.imgPath, this.imgName);
            }).catch((error)=>{
              console.log("error in update profile pic value: " + JSON.stringify(error));
            })     
          }     
          
          loading.dismiss();
          this.showToast();
          this.navCtrl.setRoot('HoprofilePage');
        }).catch((error)=>{
          console.log("error in update profile values: " + JSON.stringify(error));
        })
      }).catch((error: "auth/email-already-in-use")=> {
        loading.dismiss();
        this.showEmailToast();
      })
    }  
  }
}