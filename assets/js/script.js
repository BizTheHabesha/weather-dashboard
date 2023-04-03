// the API key will remain the same throughout the code.
const APIKEY = 'd6d727c8c68c5cd31db30ad289ac8254';
// maximum number of search results from Open Weather Map
const LIMIT = '5';
// Wrap code in a call to jQuery so all elments on the page will load before we do anything
$(function(){
    let weatherSearchHistory = {
        history: Array()
    }
    if(localStorage.getItem('weatherSearchHistory')){
        if(JSON.parse(localStorage.getItem('weatherSearchHistory'))['history'].length){
            weatherSearchHistory['history'] = JSON.parse(localStorage.getItem('weatherSearchHistory'))['history'];
        weatherSearchHistory['history'].forEach((historyItem) => {
            $('.history-container').prepend($(
                `<div class="history-item col-12 p-2">
                    <button class="btn btn-secondary history-button col-12 
                    index-${weatherSearchHistory['history'].indexOf(historyItem)}"
                    >${historyItem}</button>
                </div>`
            ));
        });
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
    }else{
        localStorage.setItem('weatherSearchHistory',JSON.stringify(weatherSearchHistory));
    }
    $('.history-button').click(function(e){
        e.preventDefault();
        console.log('yes');
        $('#citySearch').val($(e.target).text());
        $('#search-btn').trigger('click');
    })
    $('#search-btn').click(function (e) { 
        e.preventDefault();
        var userSearchedCity = $('#citySearch').val();
        userSearchedCity = userSearchedCity.charAt(0).toUpperCase() + userSearchedCity.slice(1).toLowerCase();
        // get
        if(userSearchedCity){
            $.ajax({
                type: "GET",
                url: `http://api.openweathermap.org/geo/1.0/direct?q=${userSearchedCity}&limit=${LIMIT}&appid=${APIKEY}`,
            }).then(function(response){
                if(!response.length){
                    $('#citySearch').css('border', 'var(--bs-danger) 2px solid');
                    return;
                }
                $('#citySearch').css('border', 'unset');
                let lat = String(Number(response[0]['lat']).toFixed(2));
                let lon = String(Number(response[0]['lon']).toFixed(2));
                console.log('lat:'+lat + ' lon:' + lon);
                // get 5 day forecast from Open Weather Map using lat, long, and the apikey
                $.ajax({
                    type: 'GET',
                    url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}`,
                    data: {
                        units: 'imperial'
                    }
                }).then(function(response){
                    console.log('--- current ---');
                    console.log(response);
                    $('#current-weather-card').css('display', 'flex');
                    $('.city-date').text(`Weather in ${userSearchedCity} on ${dayjs().format('M/DD/YYYY')}`)
                    $('#current-weather-card').children('.temp').text(`Temp: ${response['main']['temp']} °F`)
                    $('#current-weather-card').children('.wind').text(`Wind: ${response['wind']['speed']} MPH`)
                    $('#current-weather-card').children('.humidity').text(`Humidity: ${response['main']['humidity']} %`)
                });
                $.ajax({ 
                    type: 'GET',
                    url: `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}`,
                    data: {
                        units: 'imperial'
                    }
                }).then(function(response){
                    console.log('--- forecast ---');
                    console.log(response);
                    $('#placeholder-text-h2').css('display', 'none');
                    $('#forecast-weather-card-title').css('display', 'unset');
                    $('.forecast-card').css('display', 'unset');
                    for(let card of $('.forecast-card')){
                        cardID = Number($(card).attr('id').replace('forecast-weather-card-',''));
                        $(card).children('.date').text(dayjs().add(cardID, 'day').format('M/DD/YYYY'));
                        $(card).children('.temp').text(`Temp: ${Math.round(response['list'][(cardID*7)-3]['main']['temp'])} °F`)
                        $(card).children('.wind').text(`Wind: ${response['list'][(cardID*7)-3]['wind']['speed']} MPH`)
                        $(card).children('.humidity').text(`Humidity: ${response['list'][(cardID*7)-3]['main']['humidity']} %`)
                    }
                });
                if(!weatherSearchHistory['history'].includes(userSearchedCity)){
                    weatherSearchHistory['history'].unshift(userSearchedCity);
                    if(weatherSearchHistory['history'].length > 10){
                        weatherSearchHistory['history'].pop();
                        $('.index-9').remove();
                    }
                    $('.history-container').prepend($(
                    `<div class="history-item col-12 p-2">
                        <button class="btn btn-secondary history-button col-12 index-${weatherSearchHistory['history'].indexOf(userSearchedCity)}"
                        >${userSearchedCity}</button>
                    </div>`
                    ));
                    $('.history-button').click(function(e){
                        e.preventDefault();
                        console.log('yes');
                        $('#citySearch').val($(e.target).text());
                        $('#search-btn').trigger('click');
                    })
                    localStorage.setItem('weatherSearchHistory', JSON.stringify(weatherSearchHistory))
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
        }else{
            $('#citySearch').css('border', 'var(--bs-danger) 2px solid');
        }
    });
})
// $('#placeholder-btn').click(function(e){
//     e.preventDefault();
//     weatherSearchHistory = {
//         history: Array()
//     };
//     localStorage.setItem('weatherSearchHistory', JSON.stringify(weatherSearchHistory));
//     location.reload();
// });