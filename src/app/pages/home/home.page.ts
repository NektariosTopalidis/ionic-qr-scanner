import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  scanResult = null;
  scanActive: boolean = false;

  @ViewChild('video', {static: false}) video!: ElementRef

  videoElement: any;

  loading!: HTMLIonLoadingElement | null;

  constructor(private toastCtrl: ToastController,private loadingCtrl: LoadingController) {}

  ngAfterViewInit(){
    this.videoElement = this.video.nativeElement;
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
