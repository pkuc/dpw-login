import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { GoogleFormService } from '../core/services/google-form.service';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Observable, combineLatest, defaultIfEmpty, filter, map, reduce, startWith, tap, zip } from 'rxjs';
import { UserDataRow } from '../core/interfaces/user-data.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'dpw-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  firstNameControl = new FormControl('', Validators.required);
  lastNameControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  autocompleteControl = new FormControl();
  form: FormGroup = new FormGroup({
    firstName: this.firstNameControl,
    lastName: this.lastNameControl,
    email: this.emailControl
  });


  submitted = false;
  submitting = false;
  title = 'dpw-login';
  options: UserDataRow[] = [];
  filteredOptions: Observable<UserDataRow[]> = new Observable<UserDataRow[]>();

  

  constructor(
    private googleFormService: GoogleFormService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {

    this.googleFormService.getData().subscribe(data => {
      this.options = data;
      this.filteredOptions = combineLatest([
        this.firstNameControl.valueChanges.pipe(startWith(''), filter(i => !(typeof i !== 'string'))),
        this.lastNameControl.valueChanges.pipe(startWith(''), filter(i => !(typeof i !== 'string'))),
        this.emailControl.valueChanges.pipe(startWith(''), filter(i => !(typeof i !== 'string'))),
        this.autocompleteControl.valueChanges.pipe(startWith(''))
      ]).pipe(
        startWith(''),
        map(([fnEntry, lnEntry, emailEntry, userEntry]) => {
            if (!fnEntry && !lnEntry && !emailEntry &&!userEntry) {
                return []
            }

            return this.options.filter(option => {
                return this.optionIncludesEntry(option, fnEntry) && this.optionIncludesEntry(option, lnEntry) && this.optionIncludesEntry(option, emailEntry) && this.optionIncludesEntry(option, userEntry) 
            });
        }),
        tap(options => options),
        // map(options => {
        //     return options.map(option => this.uniqueArray()))
        // })
        map(options => {
            return options.reduce((list, val) => {
                if (!list.length) return [val]
                const foundIndex = list.findIndex((t) => t['First Name'] === val['First Name'] &&  t['Last Name'] === val['Last Name'] &&  t['Email'] === val['Email']);
                if (foundIndex === -1) {
                  list.push(val);
                }
          
                return list;
              }, [] as UserDataRow[])
        })
      );
    });
  }

//   ngAfterViewInit() {
//     this.form?.addControl(this.firstNameControl);
//   }


  uniqueArray(target: Array<UserDataRow>, property: UserDataRow): Array<UserDataRow> {
    return target.filter((item, index) =>
      index === target.findIndex(t => 
        t['First Name'] === item['First Name'] &&  t['Last Name'] === item['Last Name'] &&  t['Email'] === item['Email']
      )
    );
  }

  optionIncludesEntry(option: UserDataRow, value: string) {
    // if there is no value (or it matches any field) then include it
    const shouldInclude = !value || !!option['First Name'].toLowerCase().includes(value.toLowerCase()) || !!option['Last Name'].toLowerCase().includes(value.toLowerCase()) || !!option['Email'].toLowerCase().includes(value.toLowerCase())
    return shouldInclude;
  }

  optionClicked(option: UserDataRow) {
    console.log(option);
    this.firstNameControl.setValue(option['First Name']);
    this.lastNameControl.setValue(option['Last Name']);
    this.emailControl.setValue(option['Email']);
    this.autocompleteControl.setValue('');

  }

  onSubmit(): void {
    const formData = {
      firstName: this.firstNameControl.value,
      lastName: this.lastNameControl.value,
      email: this.emailControl.value,
    };

    console.log('form:')

    this.googleFormService.submitForm(formData).subscribe({
      next: response => {
        this.submitted = true;
        console.log('Form submitted successfully!', response);
        this.snackbar.open(`Thanks, ${formData.firstName}! You are checked in`, 'Close', { 
          duration: 3000 ,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        })
        this.reset();
      },
      error: error => {
        this.submitted = true;
        this.snackbar.open(`Thanks, ${formData.firstName}! You are checked in`, 'Close', { 
          duration: 3000 ,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        })
        console.error('Error submitting form:', error);
        this.reset();
      }
    });
  }

  reset() {
    this.firstNameControl.setValue('');
    this.firstNameControl.reset();
    this.firstNameControl.setErrors(null)

    this.lastNameControl.setValue('');
    this.lastNameControl.reset();
    this.lastNameControl.setErrors(null)

    this.emailControl.setValue('');
    this.emailControl.reset();
    this.emailControl.setErrors(null)

    this.autocompleteControl.setValue('');
    this.autocompleteControl.reset();
    this.autocompleteControl.setErrors(null)

  }
  
}
