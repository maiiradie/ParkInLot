import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Slides, AlertController, ToastController, ActionSheetController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { File, FileEntry, Entry } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
// import { LoginPage } from '../login/login';

import { AuthProvider } from '../../providers/auth/auth';

import firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-coregister',
  templateUrl: 'coregister.html',
})
export class CoregisterPage {
  files: any;
  userForm: FormGroup;
  carForm: FormGroup;
  imgName;
  fileName;
  caption = "Choose a Photo";
  captionFile = "Choose a File";
  private imgUrl;
  private fileUrl;
  private imgPath;
  private fileDir;
  private imgType;
  private userId;
 
	constructor(public loadingCtrl: LoadingController,
		private fb: FormBuilder, 
		private authProvider:AuthProvider, 
		public navCtrl: NavController, 
		public navParams: NavParams,
		public alertCtrl: AlertController,
		public actionSheetCtrl: ActionSheetController,
		private fileChooser: FileChooser,
		private file: File,
 		private filePath: FilePath,
 		private transfer: FileTransfer,
		private toastCtrl: ToastController) {
      this.userForm = this.fb.group({
        'fname':[null,Validators.compose([Validators.required, Validators.pattern('[^0-9]*')])],
        'lname':[null,Validators.compose([Validators.required, Validators.pattern('[^0-9]*')])],
        'email':[null,Validators.compose([Validators.required, Validators.email])],
        'password':[null,Validators.compose([Validators.required, Validators.minLength(6)])],
        'mobile':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^09[0-9]*')])]
      });

	    this.carForm = this.fb.group({
		    'plateno':[null,Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(8), Validators.pattern('[a-zA-Z]{3}[0-9]{3,4}')])],
		    'carmodel':[null,Validators.compose([Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-Z0-9 ]*')])]
	    });

	    this.files = [];
  }

  ionViewDidLoad() {
	}

  @ViewChild('slider') slider: Slides;

  next() {
		this.slider.slideNext();
  }
  
  back() {
    this.slider.slidePrev();
  }

  presentActionSheet(file) {
    const actionSheet = this.actionSheetCtrl.create({
      title: file.name,
      buttons: [
        {
          text: 'Remove',
          role: 'destrutive',
          handler: () => {
            var index = this.files.indexOf(file);
            this.files.splice(index, 1);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });
    actionSheet.present();
  }

  choose() {
    this.fileChooser.open().then((url)=>{
      this.filePath.resolveNativePath(url).then((path)=>{
        this.file.resolveLocalFilesystemUrl(path).then((newUrl: Entry)=>{
          var fileEntry = newUrl as FileEntry;

          fileEntry.file(fileObj => {
            if (fileObj.type === "image/jpeg" || fileObj.type === "image/png") {
              if (fileObj.size <= 5000000) {
                this.imgUrl = newUrl;
                this.imgType = fileObj.type;

                let dirPath = newUrl.nativeURL;
                this.imgName = dirPath;
                let dirPathSegments = dirPath.split('/'); //break string to array
                dirPathSegments.pop();  //remove last element
                dirPath = dirPathSegments.join('/');
                this.imgPath = dirPath;
          
                this.caption = "Change Photo";
              } else {
                this.showAlert('File Size Exceeded', 'Your file has exceeded 5MB.');
              }
            } else {
              this.showAlert('Invalid Image', 'Image must be a png or jpeg file.');
            }
          })  
        }).catch((e)=>{
          alert("error " + JSON.stringify(e));
        })
      })
    })
  }

  chooseFile() {
    this.fileChooser.open().then((url)=>{
      this.filePath.resolveNativePath(url).then((path)=>{
        this.file.resolveLocalFilesystemUrl(path).then((newUrl: Entry)=>{
          var fileEntry = newUrl as FileEntry;
          var fileType;
          fileEntry.file(fileObj => {
            fileType = fileObj.type;

            if (fileObj.size <= 5000000) {
              this.fileUrl = newUrl;
  
              let dirPath = newUrl.nativeURL;
              this.fileName = dirPath;
              let dirPathSegments = dirPath.split('/'); //break string to array
              dirPathSegments.pop();  //remove last element
              dirPath = dirPathSegments.join('/');
              this.fileDir = dirPath;

              this.files.push({
                path: this.fileDir,
                name: this.fileUrl.name,
                type: fileType
              });
            } else {
              this.showAlert('File Size Exceeded', 'Your file has exceeded 5MB.');
            }
          })
        })
      })
    })
  }

  async upload(buffer, name, type) {
    let blob = new Blob([buffer], { type: type });

    let storageHere = firebase.storage();

    storageHere.ref('images/' + this.userId + "/" + name).put(blob).catch((error)=>{
      alert("error" + JSON.stringify(error));
    })
  }

  uploadFile(path, name, type) {
    this.file.readAsArrayBuffer(path, name).then((buffer)=>{
      let blob = new Blob([buffer], { type: type });

      let storageHere = firebase.storage();

      storageHere.ref('files/' + this.userId + "/" + name).put(blob);
    }).catch((error)=>{
      alert("error(1): " + JSON.stringify(error, Object.getOwnPropertyNames(error)));
    })
  }

  showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }

  showToast() {
    let toast = this.toastCtrl.create({
      message: 'Account was created successfully. Account is pending for approval from admin.',
			duration: 3000
    })
    toast.present();
  }

  register(){
	  const loading = this.loadingCtrl.create({
		  content:'Creating account...'
	  });

	  loading.present(loading);

	  this.authProvider.registerCarOwner(this.userForm.value, this.carForm.value, this.imgUrl.name).then((d) => {
		  this.userId = this.authProvider.setID();

		  this.file.readAsArrayBuffer(this.imgPath, this.imgUrl.name).then(async (buffer)=>{
			  await this.upload(buffer, this.imgUrl.name, this.imgType).then(async (d)=>{
			
				  for(var i = 0; i < this.files.length; i++) {
					  this.uploadFile(this.files[i].path, this.files[i].name, this.files[i].type);
          }
          await this.authProvider.logoutUser();
          
          loading.dismiss();
          this.showToast();
          this.navCtrl.setRoot("LoginPage");
			  });
		  });
	  }).catch((error) => {
      loading.dismiss();
      if (error.code === "auth/email-already-in-use") {
        this.showAlert('Email in Use', 'Your email is already taken or used.');
        this.slider.slideTo(0);
      } else if (error.code === "auth/network-request-failed") {
        this.showAlert('No Connection', 'No internet connection detected. Please connect and try again.');
      }
    });
  }
}
