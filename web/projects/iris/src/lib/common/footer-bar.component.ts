import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'iris-footer',
  template: `
    <!-- Footer -->
    <footer class="page-footer font-small blue-grey lighten-5 pt-1">
      <!-- Footer Links-->
      <div class="container-fluid text-center text-md-left footer-Gap">
        <!-- Grid row -->
        <div class="row mt-2">
          <!-- Grid column -->
          <div class="col-md-6 mt-md-0">
            <!-- Content -->
            <h6
              class="dark-grey-text font-weight-bold text-uppercase mb-0 text-center"
            >
              {{ AppName }}
            </h6>
            <hr class="mx-auto bg-warning" style="width: 24rem;" />
            <p class="dark-grey-text mb-3 footer_Text text-center">
              {{ AppDescription }}
            </p>
          </div>
          <!-- Grid column -->
          <hr class="clearfix w-100 d-md-none pb-3" />
          <!-- Grid column -->
          <div class="col-md-3 mb-md-0 mb-3">
            <!-- links -->
            <h6
              class="text-uppercase font-weight-bold dark-grey-text mb-0 text-center"
            >
              USEFUL LINKS
            </h6>
            <hr class="mx-auto bg-warning" style="width:6rem;" />
            <ul class="list-unstyled dark-grey-text footer_Text text-center">
              <li>
                <a
                  target="_blank"
                  style="color:#212529;text-decoration:none;"
                  href="http://google.com"
                  >Google</a
                >
                >
              </li>
            </ul>
          </div>
          <!-- Grid column -->

          <!-- Grid column -->
          <div class="col-md-3 mb-md-0 mb-3">
            <!-- links -->
            <h6
              class="text-uppercase font-weight-bold dark-grey-text mb-0 text-center"
            >
              Contact
            </h6>
            <hr class="mx-auto bg-warning" style="width:4rem;" />
            <p class="dark-grey-text footer_Text text-center">
              <a
                class="fa fa-envelope"
                style="color:#212529;text-decoration:none;"
                target="_top"
                href="mailto:satish4pandu@gmail.com"
              ></a>
              <a
                style="color:#212529;text-decoration:none;"
                target="_top"
                href="mailto:satish4pandu@gmail.com"
                >Support</a
              >
            </p>
          </div>
          <!-- Grid column -->
        </div>
        <!-- Grid row -->
      </div>
      <!-- FooterLinks -->
      <div class="content-wrapper">
        <div class="float-left"></div>
        <div class="float-right">
          <img
            src="../assets/footer.gif"
            alt="Together we can do"
            height="59"
            width="211"
          />
        </div>
      </div>

      <!-- Copyright -->
      <div class="footerline"></div>
      <div style="margin-left:0px !important; background-color:#AE1E23;">
        <div class="footer-copyright text-center py-1 font_color">
          © {{ today | date: 'y' }} Copyright:
          <a href="#">{{ AppName }}</a>
          <p>Version:3.3.3333</p>
        </div>
      </div>
      <!-- Copyright -->
    </footer>
    <!-- Footer -->
  `,
})
export class IrisFooterComponent implements OnInit {
  today: number = Date.now();
  @Input() AppName = '';
  @Input() AppDescription = '';
  constructor() {}
  ngOnInit(): void {}
}
