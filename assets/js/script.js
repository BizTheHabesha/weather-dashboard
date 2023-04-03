// the API key will remain the same throughout the code.
const APIKEY = 'd6d727c8c68c5cd31db30ad289ac8254';
// maximum number of search results from Open Weather Map
const LIMIT = '5';
// Wrap code in a call to jQuery so all elments on the page will load before we do anything
$(function(){
    // initialize obj to store history internally
    let weatherSearchHistory = {
        history: Array()
    }
    // if local history is already intialized (checks for falsy)
    if(localStorage.getItem('weatherSearchHistory')){
        // check if history has elements (checks for falsy)
        if(JSON.parse(localStorage.getItem('weatherSearchHistory'))['history'].length){
            // add local history to internal history
            weatherSearchHistory['history'] = JSON.parse(localStorage.getItem('weatherSearchHistory'))['history'];
        // for each item in the internal history
        weatherSearchHistory['history'].forEach((historyItem) => {
            // append a button containing each city and a data attr containing that city's index in internal history
            $('.history-container').prepend($(
                `<div class="history-item col-12 p-2">
                    <button class="btn btn-secondary history-button col-12 
                    index-${weatherSearchHistory['history'].indexOf(historyItem)}"
                    >${historyItem}</button>
                </div>`
            ));
        });
        // styling for placeholder button, turning it into a clear history button
        // and classes for styling and event listner
        $('#placeholder-btn').attr('class', 'btn btn-danger col-12 clear-history');
        // enable the button
        $('#placeholder-btn').removeAttr('disabled');
        // change the text of the button
        $('#placeholder-btn').text('Clear History');
        // add event listener to the updated button
        $('.clear-history').click(function(e){
            e.preventDefault();
            // reinitialize the internal history obj
            weatherSearchHistory = {
                history: Array()
            };
            // set the history to the now reinitialized obj
            localStorage.setItem('weatherSearchHistory', JSON.stringify(weatherSearchHistory));
            // reload the page, removing any displayed weather and history
            location.reload();
        });
        }
    // if local history is not initialized, initialize it.
    }else{
        localStorage.setItem('weatherSearchHistory',JSON.stringify(weatherSearchHistory));
    }
    // add event listener to history buttons created above
    $('.history-button').click(function(e){
        e.preventDefault();
        // put the city in the search box
        $('#citySearch').val($(e.target).text());
        // trigger the search button to start a search
        $('#search-btn').trigger('click');
    })
    // add event listener to search button
    $('#search-btn').click(function (e) {
        e.preventDefault();
        // store the users city and capitalize it
        var userSearchedCity = $('#citySearch').val();
        userSearchedCity = userSearchedCity.charAt(0).toUpperCase() + userSearchedCity.slice(1).toLowerCase();
        // check if the searched city is empty
        if(userSearchedCity){
            // get latitude and longitude using user search, page limit, and api key
            $.ajax({
                type: "GET",
                url: `http://api.openweathermap.org/geo/1.0/direct?q=${userSearchedCity}&limit=${LIMIT}&appid=${APIKEY}`,
            }).then(function(response){
            // an empty response means the city is an invalid search
                if(!response.length){
                    // error search box styling
                    $('#citySearch').css('border', 'var(--bs-danger) 2px solid');
                    return;
                }
                // remove error styling on search box
                $('#citySearch').css('border', 'unset');
                // get the latitude and longitude from the API response
                let lat = String(Number(response[0]['lat']).toFixed(2));
                let lon = String(Number(response[0]['lon']).toFixed(2));
                // get current weather from Open Weather Map using lat, long, and the api key
                $.ajax({
                    type: 'GET',
                    url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}`,
                    data: {
                        // instructs open weather map to convert to imperial units
                        units: 'imperial'
                    }
                }).then(function(response){
                    // display current weather cards
                    $('#current-weather-card').css('display', 'flex');
                    // get date from dayjs and display in corresponding element
                    $('.city-date').text(`Weather in ${userSearchedCity} on ${dayjs().format('M/DD/YYYY')}`)
                    // append the icon to the end of the date element
                    $('.city-date').append($(`<img id="wicon" src="${"http://openweathermap.org/img/w/" + response['weather'][0]['icon'] + ".png"}" alt="Weather Icon">`))
                    // get temperature from OWM and display in corresponding element
                    $('#current-weather-card').children('.temp').text(`Temp: ${response['main']['temp']} °F`)
                    // get wind speed from OWM and display in corresponding element
                    $('#current-weather-card').children('.wind').text(`Wind: ${response['wind']['speed']} MPH`)
                    // get humidity from OWM and display in corresponding element
                    $('#current-weather-card').children('.humidity').text(`Humidity: ${response['main']['humidity']} %`)
                });
                // get 5 day forecast from OWM
                $.ajax({ 
                    type: 'GET',
                    url: `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}`,
                    data: {
                        // instructs OWM to conver to imperial units
                        units: 'imperial'
                    }
                }).then(function(response){
                    // remove the placeholder text
                    $('#placeholder-text-h2').css('display', 'none');
                    // display the forecast cards
                    $('#forecast-weather-card-title').css('display', 'unset');
                    $('.forecast-card').css('display', 'unset');
                    // apply to all forecast cards
                    for(let card of $('.forecast-card')){
                        // each forecast card contains its place in its id, so we extract that
                        cardID = Number($(card).attr('id').replace('forecast-weather-card-',''));
                        // get the date, then add days based on the the extracted id
                        $(card).children('.date').text(dayjs().add(cardID, 'day').format('M/DD/YYYY'));
                        // append the icon to the end of the date element
                        $(card).children('.date').append($(`<img id="wicon" src="${"http://openweathermap.org/img/w/" + response['list'][(cardID*7)-3]['weather'][0]['icon'] + ".png"}" alt="Weather Icon">`))
                        // get the temprature from OWM and dispaly in corresponding element
                        $(card).children('.temp').text(`Temp: ${Math.round(response['list'][(cardID*7)-3]['main']['temp'])} °F`)
                        // get the wind speed from OWM and display in coressponding element
                        $(card).children('.wind').text(`Wind: ${response['list'][(cardID*7)-3]['wind']['speed']} MPH`)
                        // get the humidity from OWM and display in corresponding element
                        $(card).children('.humidity').text(`Humidity: ${response['list'][(cardID*7)-3]['main']['humidity']} %`)
                    }
                });
                // check if the searched city is already in history
                if(!weatherSearchHistory['history'].includes(userSearchedCity)){
                    // add the searched city to history
                    weatherSearchHistory['history'].unshift(userSearchedCity);
                    // if the length of the array has reached 10 els, then remove the last element and remove it from display
                    if(weatherSearchHistory['history'].length > 10){
                        weatherSearchHistory['history'].pop();
                        $('.index-9').remove();
                    }
                    // and a new button to history container
                    $('.history-container').prepend($(
                    `<div class="history-item col-12 p-2">
                        <button class="btn btn-secondary history-button col-12 index-${weatherSearchHistory['history'].indexOf(userSearchedCity)}"
                        >${userSearchedCity}</button>
                    </div>`
                    ));
                    // add event listener to history buttons
                    $('.history-button').click(function(e){
                        e.preventDefault();
                        // set the value of the search box to the value of the history button clicked
                        $('#citySearch').val($(e.target).text());
                        // trigger the click for the search button
                        $('#search-btn').trigger('click');
                    })
                    // update the local storage with the internal history
                    localStorage.setItem('weatherSearchHistory', JSON.stringify(weatherSearchHistory))
                    // in the case where this is the first item searched, change the placeholder into the clear button
                    $('#placeholder-btn').attr('class', 'btn btn-danger col-12 clear-history');
                    $('#placeholder-btn').removeAttr('disabled');
                    $('#placeholder-btn').text('Clear History');
                    $('.clear-history').click(function(e){
                        e.preventDefault();
                        weatherSearchHistory = {
                            history: Array()
                        };
                        localStorage.setItem('weatherSearchHistory', JSON.stringify(weatherSearchHistory));
                        location.reload();
                    });
                }
            });
        // if the user searches an empty string, styling for error
        }else{
            $('#citySearch').css('border', 'var(--bs-danger) 2px solid');
        }
    });
})