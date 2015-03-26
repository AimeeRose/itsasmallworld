function findCheapest(origin, destination) {
  var exchangeRates;
  $.get('http://api.fixer.io/latest?base=USD', function(data) {
    exchangeRates = data
  })

  var googleApiUrl = 'https://www.googleapis.com/qpxExpress/v1/trips/search?key=AIzaSyApKrIAV2s6c3feZebz9j66PEy16R2j_mY'

  todaysDate = new Date().toISOString().substring(0,10)
  $.ajax({
    method: 'POST',
    url: googleApiUrl,
    data: JSON.stringify({
      request: {
        passengers: {
          kind: "qpxexpress#passengerCounts",
          adultCount: 1,
          childCount: 0,
          infantInLapCount: 0,
          infantInSeatCount: 0,
          seniorCount: 0
        },
        slice: [
          {
            kind: "qpxexpress#sliceInput",
            origin: origin,
            destination: destination,
            date: todaysDate,
            maxStops: 2,
            maxConnectionDuration: null,
            preferredCabin: null,
            permittedDepartureTime: {
              kind: "qpxexpress#timeOfDayRange",
              earliestTime: null,
              latestTime: null
            },
            permittedCarrier: [
              null
            ],
            alliance: null,
            prohibitedCarrier: [
              null
            ]
          }
        ],
        maxPrice: null,
        saleCountry: null,
        refundable: null,
        solutions: 5
      }
    }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json'
  }).done(function(data) {
    var tripOptions = data.trips.tripOption

    if (!tripOptions) { 
      $('.fare').html('No fare information available for this route.')
      return
    }
  
    var saleTotal = tripOptions[0].saleTotal
    var currency = saleTotal.substring(0,3)
    var amount = parseFloat(saleTotal.substring(3,saleTotal.length))
    var fare;
    if (_.includes(_.keys(exchangeRates.rates), currency)) {
      fare = '$' + Math.round(amount / exchangeRates.rates[currency] * 100) / 100;
    } else if (currency == 'USD') {
      fare = '$' + amount;
    } else {
      fare = currency + ' ' + amount;
    }
    //$('.fare').html(fare)
    console.log(fare)
  })
}