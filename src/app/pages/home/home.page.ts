import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

import jsQR from 'jsqr';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  scanResult: any = null;
  scanActive: boolean = false;

  @ViewChild('video', {static: false}) video!: ElementRef
  @ViewChild('canvas', {static: false}) canvas!: ElementRef

  videoElement: any;
  canvasElement: any;
  canvasContext: any


  loading!: HTMLIonLoadingElement | null;

  constructor(private toastCtrl: ToastController,private loadingCtrl: LoadingController) {}

  ngAfterViewInit(){
    this.videoElement = this.video.nativeElement;
    this.canvasElement = this.canvas.nativeElement;
    this.canvasContext = this.canvasElement.getContext('2d');
  }

  async startScan(){
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: 'user'}
    });

    this.videoElement.srcObject = stream;
    this.videoElement.setAttribute('playsinline', true);
    this.scanActive = true;
    this.videoElement.play();

    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    requestAnimationFrame(this.scan.bind(this));
  }

  private async scan(){
    if(this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA){
      if(this.loading){
        await this.loading.dismiss();
        this.loading = null;
        this.scanActive = true;
      }

      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;

      this.canvasContext.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      )
      
      

      const code = jsQR(imageData.data, imageData.width,imageData.height,{
        inversionAttempts: 'dontInvert'
      });
      
      console.log('code: ' + code?.data);
      if(code){
        this.scanActive = false;
        this.scanResult = code?.data;
        this.showQrToast();
      }
      else{
        if(this.scanActive){
          requestAnimationFrame(this.scan.bind(this));
        }
      }
    }
    else{
      requestAnimationFrame(this.scan.bind(this));
    }
  }

  stopScan(){
    this.scanActive = false;
  }

  reset(){
    this.scanResult = null;
  }

  private async showQrToast(){
    const toast = await this.toastCtrl.create({
      message: `Scanned ${this.scanResult}?`,
      position: 'top',
      buttons: [
        {
          text: 'Okay',
          role: 'cancel'
        }
      ]
    })

    toast.present();
  }
}
