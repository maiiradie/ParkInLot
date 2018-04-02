import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Slides, AlertController, ToastController, ActionSheetController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { File } from '@ionic-native/file';
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
  public imgName;
  public fileName;
  public caption = "Choose a Photo";
  public captionFile = "Choose a File";
  private imgUrl;
  private fileUrl;
  private imgPath;
  private fileDir;
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
	 	    'fname':[null,Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
	 	    'lname':[null,Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
	 	    'email':[null,Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
	 	    'password':[null,Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(30)])],
	 	    'mobile':[null,Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(11)])],
	    });

	    this.carForm = this.fb.group({
		    'plateno':[null,Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(8)])],
		    'carmodel':[null,Validators.compose([Validators.required, Validators.minLength(4)])],
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
            // console.log('Remove clicked');
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
	      this.file.resolveLocalFilesystemUrl(path).then((newUrl)=>{
	        this.imgUrl = newUrl;

	        let dirPath = newUrl.nativeURL;
	        this.imgName = dirPath;
	        let dirPathSegments = dirPath.split('/'); //break string to array
	        dirPathSegments.pop();  //remove last element
	        dirPath = dirPathSegments.join('/');
	        this.imgPath = dirPath;
	        
	        this.caption = "Change Photo";
	                 
	      }).catch((e)=>{
	        alert("error " + JSON.stringify(e));
	      })
      })
  	})
  }

  chooseFile() {
    this.fileChooser.open().then((url)=>{
      this.filePath.resolveNativePath(url).then((path)=>{
        this.file.resolveLocalFilesystemUrl(path).then((newUrl)=>{
          // const fileTransfer: FileTransferObject = this.transfer.create();
          this.fileUrl = newUrl;
          alert(this.fileUrl);
  
          let dirPath = newUrl.nativeURL;
          this.fileName = dirPath;
          let dirPathSegments = dirPath.split('/'); //break string to array
          dirPathSegments.pop();  //remove last element
          dirPath = dirPathSegments.join('/');
          this.fileDir = dirPath;
          
          alert(dirPath);

          this.files.push({
            path: this.fileDir,
            name: this.fileUrl.name
          });

          alert(JSON.stringify(this.files));
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

  uploadFile(path, name) {
    this.file.readAsArrayBuffer(path, name).then((buffer)=>{
      let blob = new Blob([buffer], { type: 'application/pdf' });

      let storageHere = firebase.storage();

      storageHere.ref('files/' + this.userId + "/" + name).put(blob);
    }).catch((error)=>{
      alert("error(1): " + JSON.stringify(error, Object.getOwnPropertyNames(error)));
    })
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Email in Use',
      subTitle: 'Your email is already taken or used.',
      buttons: ['OK']
    });
    alert.present();
  }

  showToast() {
    let toast = this.toastCtrl.create({
      message: 'Account was created successfully.',
			duration: 8000
    })
    toast.present();
  }

  register(){
	const loading = this.loadingCtrl.create({
		content:'Logging in...'
	});

	loading.present(loading);

	this.authProvider.registerCarOwner(this.userForm.value, this.carForm.value, this.imgUrl.name).then((d) => {
			this.userId = this.authProvider.setID();

			this.file.readAsArrayBuffer(this.imgPath, this.imgUrl.name).then(async (buffer)=>{
				await this.upload(buffer, this.imgUrl.name).then((d)=>{
			
					for(var i = 0; i < this.files.length; i++) {
						this.uploadFile(this.files[i].path, this.files[i].name);
					}
				}).catch((error)=>{
					alert("error(2): " + JSON.stringify(error, Object.getOwnPropertyNames(error)));
				})
			}).catch((err)=> {
				alert("error(3): " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
			}).catch((error:"auth/email-already-in-use") => {
				this.showAlert();
        this.back();
			})
	})

	loading.dismiss();
    this.showToast();
    this.navCtrl.setRoot("LoginPage");
  }
}
