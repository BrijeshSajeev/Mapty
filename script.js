'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map,mapEvent;

class Workout{
    date=new Date();
    id=String(Date.now()).slice(-10);
    
    constructor(distance,duration,coords){
        this.distance=distance;
        this.duration=duration;
        this.coords=coords;
    }
    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
          months[this.date.getMonth()]
        } ${this.date.getDate()}`;
      }
    
}
class Running extends Workout{
    type='running';
    constructor(distance,duration,coords,cadence){
        super(distance,duration,coords);
        this.cadence=cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace(){
        this.pace = this.duration/this.distance;
        return this;
    }
}
class Cycling extends Workout{
    type='cycling'
    constructor(distance,duration,coords,elevationGain){
        super(distance,duration,coords);
        this.elevationGain=elevationGain;
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed(){
        this.speed=this.distance/this.duration;
        return this;
    }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1)

class App{
    #map;
    #mapEvent;
    #workout=[];
    #mapZoomLevel=13;
    constructor(){
                this._getPosition();

                // Getting data from the Local Stroage
                this._getLocalStorage();

                // handling summit event
                form.addEventListener('submit',this._newWorkout.bind(this))
            
                inputType.addEventListener('change',this._toggleElevationField);

                // handling click event in list of workouts 
                containerWorkouts.addEventListener('click',this._moveToMap.bind(this))
        }

        _getPosition(){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){
                alert("Error on getting position")
            })
        }
        _loadMap(pos){
        
                const {latitude}=pos.coords;
                const {longitude}=pos.coords;
                // console.log(latitude,longitude);
                // console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);
                const coords=[latitude,longitude];
            
                this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
            
            // L.marker(coords).addTo(map)
            //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
                // .openPopup();
            
                this.#map.on('click',this._showForm.bind(this))

                // Adding marker to the elements from the local storage
                this.#workout.forEach(work=>{
                this._renderMarker(work);  
                })
        }
    _showForm(mapE){ 
            this.#mapEvent=mapE;
            form.classList.remove('hidden');
            inputDistance.focus();
        }
    _hideForm(){
        // Clear form
        inputCadence.value=inputDistance.value=inputDuration.value=inputElevation.value='';
        form.style.display='none';
        form.classList.add('hidden');
        setTimeout(()=>  form.style.display='grid',1000);

    }
    _toggleElevationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
  
        }
    _newWorkout(e){
        e.preventDefault();
        
        const isNumber=(...numbers)=> numbers.every(no=>Number.isFinite(no));

        const isPositive=(...numbers)=>numbers.every(no=>no > 0);
        // Get data from the form
        const type=inputType.value;
        const distance=+inputDistance.value;
        const duration=+inputDuration.value;
        let workout;
        const {lat,lng}=this.#mapEvent.latlng;
        const cood=[lat,lng]
        
        
        // if workout is running create Running obj
        if(type==='running'){
            // CHECK FOR CORRECT VALUES
            const cadance=+inputCadence.value;
            if(!isNumber(distance,duration,cadance) || !isPositive(distance,duration,cadance))
                return alert('Enter valid info..')    
             workout=new Running(distance,duration,cood,cadance);
        
            }
        // if workout is cycling create cycling obj
            if(type==='cycling'){
                 // CHECK FOR CORRECT VALUES
                const elevationG=+inputElevation.value;
                if(!isNumber(distance,duration,elevationG) || !isPositive(distance,duration))
                        return alert('Enter valid info..')    
                        workout=new Cycling(distance,duration,cood,elevationG);
                }
        // Add new obj to the workout array
                // console.log(workout);
                this.#workout.push(workout);
                this._renderMarker(workout);
        
        // Render workout 
        this._renderForm(workout);

        
        // Clear form and hide form
        this._hideForm();
        
        // Store data to the Local storage
        this._setLocalStorage()
        
        
    }
    _renderMarker(workout){
         
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth:300,
            minWidth:100,
            autoClose:false,
            closeOnClick:false,
            className:`${workout.type}-popup`,
        })).setPopupContent(`${workout.type==='running'?'🏃‍♂️' :'🚴‍♀️'} ${workout.description}`)
        .openPopup();
    }
    _renderForm(workout){
        let html=`
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.type==='running'?'🏃‍♂️' :'🚴‍♀️'} ${workout.description}</h2>
        <div class="icon">
            <span class="icon--edit">🖊️</i></span>
            <span class="icon--delete">🚮</i></span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">${workout.type==='running'?'🏃‍♂️' :'🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        `

        if(workout.type==='running'){
            html+=`
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
            `

          
        }
        else{
            html +=`
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
            
            `
        }

        form.insertAdjacentHTML('afterend',html);
    }
    _moveToMap(e){
        const workoutEl=e.target.closest('.workout');
        // console.log(workoutEl);
        if(!workoutEl ) return;

        const workout=this.#workout.find(work => work.id===workoutEl.dataset.id);
        // console.log(workout);

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
              duration: 1,
            },
          });
    }
    _setLocalStorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#workout));
    }
    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;
   console.log(data);
    this.#workout = data;
    // console.log(this.#workout);

    this.#workout.forEach(work => {
      this._renderForm(work);
    });
    
    }

    reset(){
        localStorage.removeItem('workouts');
        location.reload();
    }
}
const app=new App();
