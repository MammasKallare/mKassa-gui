import { Component, OnInit, ViewEncapsulation, Input, DoCheck } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { of } from 'rxjs/observable/of';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Product } from '../product';
import { Transaction } from '../transaction';
import { ProductService } from '../product.service';

import qz from 'qz-tray';
import KEYUTIL from 'jsrsasign';
import stob64 from 'jsrsasign';
import hextorstr from 'jsrsasign';
//import RSVP from 'rsvp';
//import rsvp from 'rsvp';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CartComponent implements OnInit, DoCheck {

  @Input() products: Product[];
  sum: number;

  stageShop: boolean;
  stageCheckout: boolean;
  stageConfirm: boolean;
  paymentMethod: string;

  constructor(private productService: ProductService) { }

  ngOnInit() {
  	this.stageShop = true;
  	this.stageCheckout = false;
  	this.stageConfirm = false;
  }

  calcSum(){
  let s = 0;
    if (!!this.products) {
	    for (var i = 0, len = this.products.length; i < len; i++) {
	  		s += this.products[i].price;
		}
	}
	return s;
  }

  ngDoCheck(){
    this.sum = this.calcSum();
  }

  checkout(){
  	var t = new Transaction();
  	t.paymentMethod = this.paymentMethod;
  	t.amountPaid = this.sum;
  	t.products = this.products;

  	var r = this.productService.postTransaction(t);

  	this.products.splice(0,999);
  }

  buildReceipt(exemplar, transaction, products) {
      var d = new Date();
      var width = 44;

      var i = 0;
      var data = [];
      data[i++] = '\x1B' + '\x40';          // init
      data[i++] = '\x1B' + '\x45' + '\x0D'; // bold on
      data[i++] = '\x1B' + '\x61' + '\x31'; // center align
      data[i++] = '\x1D' + '\x21' + '\x11'; // double font size
      data[i++] = 'WonderLAN';
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x1D' + '\x21' + '\x00'; // standard font size
      data[i++] = '\x1B' + '\x45' + '\x0A'; // bold off
      data[i++] = exemplar;                 // Write's out whos recipe it is.
      data[i++] = '\x0A';                   // line break
      data[i++] = d.toLocaleString();       // Todays date
      data[i++] = '\x0A';                   // line break
      data[i++] = 'Betalsätt: ' + transaction.paymentMethod;
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x0A';                   // line break
      data[i++] = '------------------------------------------' + '\x0A', // horizontal rule + line break
      data[i++] = '\x0A';                   // line break

      var name_length = 0;
      // Find the longest name
      products.forEach(function(element){
        if (element.name.length > name_length){
          name_length = element.name.length;
        }
      });
      if(name_length > 10){
        name_length = 10;
      }

      var total = 0;
      // List all items
      for (var key in products) {
        var el = products[key];
        var productname = el.name;
        if(productname.length > 10){
          productname = productname.substring(0, 11);
        }
        var used_width = 0;
        var name_ln = (name_length - productname.length) + 4;

        data[i++] = '\x1B' + '\x61' + '\x30'; // left align
        data[i++] = productname;
        data[i++] = Array(name_ln).join(' ');;
        var tmp = '1' + 'st' + ' * ' + el.price + 'kr';
        data[i++] = tmp;

        used_width += name_length;
        used_width += 4; // Spaced between name and count
        used_width += tmp.length;

        var price = el.price;
        var price_print = price + 'kr';

        used_width += price_print.length;

        var width_left = width - used_width;

        data[i++] = Array(width_left).join(' ');

        total += price;
        data[i++] = price_print;
        data[i++] = '\x0A';                   // line break
      }

      data[i++] = '\x1B' + '\x61' + '\x30'; // left align
      data[i++] = '\x0A';                   // line break
      data[i++] = '------------------------------------------' + '\x0A'; // horizontal rule + line break
      data[i++] = '\x1B' + '\x61' + '\x32', // right align
      data[i++] = 'Total summa: ' + total + 'kr';
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x0A';                   // line break
      data[i++] = 'Org-nummer: 802460-7155'
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x1B' + '\x61' + '\x31'; // center align
      data[i++] = 'Tack för ditt köp!';
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x0A';                   // line break
      data[i++] = '\x1B' + '\x69';          // cut paper

      return data;
    }

  printReceipt(data){

    var privateKey = "-----BEGIN PRIVATE KEY-----\n" +
    "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDOGjSbBKt1oGoDZ2LFBEN5YG7//oWrPjXBL32FaGYMr+spY03cEnp/ssbpsvb2E9qJlkl1DiTc7TSQP0cucVGo30VNeGsqqd90cFPI4Z+E5lx9UmZaIsbQD6Q3MbUGVLWfnURk7kWV4MDbEYFqRJKC4afiWW+DVoqfVrON4VArK9R70BgLEyR1pcm5XiTMRzXtvg2K2RoKT70xdTOVOAmSYdpGahKV0xiEZayqCaBrpO7Tvpcuy/WscBaH6nPd4ILvMYnSvSsOxDxSYH05BLx5DNoe41RPdU9gmgtKdibO0jhToGY680k2MBnYcWvcsja0gMBM0x8PSU6gjmGebRuDAgMBAAECggEABu/+4VDw7I6vwtmSC4uvMcC7O8a3fSIk8RHGKd1vwfGR+tyq3EOK+A1ugKNTiMj2TDdQ1a3aM82QPWLD5J5P311Umdz5zn/VU7gMOfDOS8ztRBKn+1S8WHiOUIVN0J69VlgW20bh9L+R/k3Ci28vd1RdMFNOW59oHyDt/lKdPja17aBnnPwF/jNDhHv9Det+GO71j1b8/DniQrCaTcgQsKbOkeMGK2kk1N6QiUtv2e2SF38cjKUxWa6/aGFKo0B2A6hMHNCh8Ot+6o9XJiSBERA7veWdhRyJgLVRNFRZTcVuSlm7tIQWKyBxT2S66Tls+QNt5nhxNVz1B625j7lj4QKBgQD/L7Zy6e4MKqUDtwke24FTkSmqoCamfzS6n9KdXHAZruNo4z1AcA/AjkjHeRhn8MUb+kbEmyk9Qk8Ryx6S3Jue8394iXWSowWEXZsdIr8eMGZjlHwdRuN/xqKQD8JBa5uHggV1UVubcESkRPJs4oPQuui80AbUzzMNgoYuuGRwiwKBgQDOwm37xYKD9XJM4pewE4YOaP13xUQrOJx2UT6rwxD99pWCtsaxXyuGnFzKSNng0nDhWPrzVIkwxRk7nOsX8sBzK+9d+vo4YsI4ENMaSV9493+cH/JOn2yaxYFbAlsL5rnRGvG85PmLDN6ktddjerjvjlHQq6QszAVED435K8in6QKBgQCEMpSC/XsLpH/t58F60d4yi44ZTXQYZufLEobKbJvKQlae/LG7kxIl/8/mPm6NUibaspI8weDgUlyh7Cb/j/eypZRQvm1BNODjzJZRxrFZk1tHlSGjDRlIFYAbv34z4+ojjhED0MzzPnrg2rL4A3SkCmANiHsxfdGF2ytmQrINtwKBgChMAq2QWBip7MYJX7EEjRsf4U7HlrqpxOzWdtV5JkWpGoioYN9PAiexL/CI9FX6DeANvJNSRY7Iy1swAS3gtRt9U6DIep4kuV+9/7be2Am2ixt9qnciYUNk/Qok0mPmaw7TJow/QFeWgYoumrUbxRGDdnSqD0xf0yLpuSz4GJqJAoGBAMQSLawjKsdlpluSYS0hcjmku5/T+OCqXEH/YoRYbJziPjGm1OdhhUK2H7sadtLKVoIK2OdHxAFKXfdM7DWJ9Ctrh03MRksL7+AqBPC4rlsfmAcwL2giosctGM3HkrHvyCn4gRHOnoxywIephT2NnDtJIpyDfDAP2VGSYa2lcvyM\n" +
    "-----END PRIVATE KEY-----";

      var strip = function(key) {
          if (key.indexOf('-----') !== -1) {
              return key.split('-----')[2].replace(/\r?\n|\r/g, '');
          }
      }

    qz.security.setCertificatePromise(function (resolve, reject) {
      resolve("-----BEGIN CERTIFICATE-----\n" +
      "MIID8TCCAtmgAwIBAgIJAJwr+daoGc0nMA0GCSqGSIb3DQEBCwUAMIGOMQswCQYDVQQGEwJTRTERMA8GA1UECAwIQmxla2luZ2UxEzARBgNVBAcMCkthcmxza3JvbmExEjAQBgNVBAoMCVdvbmRlckxBTjEOMAwGA1UECwwFS2Fzc2ExDjAMBgNVBAMMBUthc3NhMSMwIQYJKoZIhvcNAQkBFhRrb250YWt0QHdvbmRlcmxhbi5zZTAeFw0xNzEwMjUxMjA2MjJaFw0yNzEwMjMxMjA2MjJaMIGOMQswCQYDVQQGEwJTRTERMA8GA1UECAwIQmxla2luZ2UxEzARBgNVBAcMCkthcmxza3JvbmExEjAQBgNVBAoMCVdvbmRlckxBTjEOMAwGA1UECwwFS2Fzc2ExDjAMBgNVBAMMBUthc3NhMSMwIQYJKoZIhvcNAQkBFhRrb250YWt0QHdvbmRlcmxhbi5zZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM4aNJsEq3WgagNnYsUEQ3lgbv/+has+NcEvfYVoZgyv6yljTdwSen+yxumy9vYT2omWSXUOJNztNJA/Ry5xUajfRU14ayqp33RwU8jhn4TmXH1SZloixtAPpDcxtQZUtZ+dRGTuRZXgwNsRgWpEkoLhp+JZb4NWip9Ws43hUCsr1HvQGAsTJHWlybleJMxHNe2+DYrZGgpPvTF1M5U4CZJh2kZqEpXTGIRlrKoJoGuk7tO+ly7L9axwFofqc93ggu8xidK9Kw7EPFJgfTkEvHkM2h7jVE91T2CaC0p2Js7SOFOgZjrzSTYwGdhxa9yyNrSAwEzTHw9JTqCOYZ5tG4MCAwEAAaNQME4wHQYDVR0OBBYEFDx7XYdIYDBGdEH/vs6L50/megl+MB8GA1UdIwQYMBaAFDx7XYdIYDBGdEH/vs6L50/megl+MAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBABA7SjjP0RCQ9Hzn/5Ft+KVUn0+p19wFT2RRXJQ+SpiqSr1exihu11SyfVTNln0IvzmgfyS6lkMclSxIEfxOIlXVmslVHBmw/ujT46e3L+r8ca1l8zHFb/XiEAT62KI3haJi5u7Sefv9DVeTnIZWWtyAqZiS7WkvFucQ4Vta/beLLkRplB/GDQW34TE4vLrt2CbqrIULjLpGxgs+fgIyI8pgIdlgWGG5D6cP71hXFKpSmbM/UE1SrKWrmeEn+hMvoa8e1LhEXklHh+A6+I46SgkmDzi+8fAyI62KbRbiZG8HSRfpYRNQlaj5nu2KHQ+PE1lOHqG5w8F8/05OvfzDAVg=\n" +
      "-----END CERTIFICATE-----");
    });

  qz.security.setSignaturePromise(function (toSign) {
      return function (resolve, reject) {
          try {
              //var pk = new RSAKey();
              //console.log(KEYUTIL);
              var pk = KEYUTIL.KEYUTIL.getKey(privateKey);
              //pk.readPrivateKeyFromPEMString(strip(privateKey));
              //console.log(pk);
              //var hex = pk.signString(toSign, 'sha1');
              var hex = pk.sign(toSign, 'sha1');
              //console.log("DEBUG: \n\n" + stob64(hextorstr(hex)));
              resolve(stob64.stob64(hextorstr.hextorstr(hex)));
          } catch (err) {
              console.error(err);
              reject(err);
          }
      };
  });



  qz.websocket.connect().then(function() {
      //var config = qz.configs.create( { file: "/tmp/test.txt" } );
      var config = qz.configs.create("metapace", {encoding:'UTF-8'});

      //var data = ['test\n','etc\n'];
      qz.print(config,data).catch(function(e){ console.error(e); });
    });

    window.setTimeout(function(){
        qz.websocket.disconnect();
      },1000);
}

  removeItem(product){
  	//console.log(product);
  	for(var i = 0, len = this.products.length; i < len; i++) {
  		if (this.products[i]._id == product._id){
  			this.products.splice(i, 1);
  			break;
  		}
  	}
  }

  setPayment(type){
  	this.paymentMethod = type;
    this.checkout();
  }

}
