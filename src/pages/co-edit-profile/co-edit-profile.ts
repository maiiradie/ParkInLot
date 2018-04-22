import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { File, FileEntry, Entry } from '@ionic-native/file';
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
  imgName;
  imgUrl;
  user;
  private imgPath;
  private userId;
  private imgType;
  private oldEmail;
  profile$: AngularFireObject<any>;

  constructor(private afdb: AngularFireDatabase, 
  	private afs:AngularFireAuth,
    public navCtrl: NavController, 
    public nav: Nav,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,
    private fb:FormBuilder,
    private fileChooser: FileChooser,
	  private file: File,
    private filePath: FilePath,
    private toastCtrl: ToastController) {
      this.userForm = this.fb.group({
        'fname':[null,Validators.compose([Validators.required])],
        'lname':[null,Validators.compose([Validators.required])],
        'email':[null,Validators.compose([Validators.required, Validators.email])],
        'password':[null,Validators.compose([Validators.minLength(6)])],
        'mobile':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11)])]
      });
    this.userId = this.authProvider.userId;
  }

  ionViewDidLoad() {
    this.afdb.object(`/profile/` + this.userId).valueChanges().take(1).subscribe( data => {
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

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    })
    toast.present();
  }

  showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }

  // Open File Chooser and select image
  changeImg() {
    this.fileChooser.open().then((url)=>{
      this.filePath.resolveNativePath(url).then((path)=>{
        this.file.resolveLocalFilesystemUrl(path).then((newUrl: Entry)=>{
          var fileEntry = newUrl as FileEntry;

          fileEntry.file(fileObj => {
            if (fileObj.type === "image/jpeg" || fileObj.type === "image/png") {
              if (fileObj.size <= 5000000) {
                this.imgType = fileObj.type;

                let dirPath = newUrl.nativeURL;
                this.imgUrl = dirPath;
                let dirPathSegments = dirPath.split('/'); //break string to array
                this.imgName = dirPathSegments.pop();  //remove last element
                dirPath = dirPathSegments.join('/');
                this.imgPath = dirPath;  
              } else {
                this.showAlert('File Size Exceeded', 'Your file has exceeded 5MB.');
              }
            } else {
              this.showAlert('Invalid Image', 'Image must be a png or jpeg file.');
            }
          })       
        }).catch((error)=>{
          console.log("error in resolving picture url: " + JSON.stringify(error));
        });
      });
    });
  }

  // Upload image to Firebase Storage
  async upload(buffer, name, type) {
    let blob = new Blob([buffer], { type: type });

    let storageHere = firebase.storage();

    storageHere.ref('images/' + this.userId + "/" + name).put(blob).catch((error)=>{
      alert("error in upload picture: " + JSON.stringify(error));
    })
  }

  editProfile() {
    var cont = true;
    const loading = this.loadingCtrl.create({
      content:'Updating profile...'
    });
  
    loading.present(loading);

    this.user = firebase.auth().currentUser;
    if (this.userForm.value['email'] != this.oldEmail) {
      this.user.updateEmail(this.userForm.value['email'])
        .catch((error: "auth/email-already-in-use")=> {
          loading.dismiss();
          this.showToast('Cannot update email. Email already taken or used.');
          cont = false;
      });
    }

    if (this.userForm.value['password'] != null) {
      this.user.updatePassword(this.userForm.value['password']);
    }

    // Update profile values
    this.afdb.object(`/profile/` + this.userId).update(this.userForm.value).then(d => {

      // Update profile picture
      if (this.imgName != undefined) {
        this.afdb.object(`/profile/` + this.userId).update({profPic: this.imgName}).then(() => {
          this.file.readAsArrayBuffer(this.imgPath, this.imgName).then(async (buffer)=>{
            await this.upload(buffer, this.imgName, this.imgType).then(() => {
              loading.dismiss();
              this.showToast('Profile updated successfully.');
              this.navCtrl.setRoot('CoprofilePage');
            });
          });
        });    
      } else {
        if (cont) {
          loading.dismiss();
          this.showToast('Profile updated successfully.');
          this.navCtrl.setRoot('CoprofilePage');
        }
      }       
    });
  }
}