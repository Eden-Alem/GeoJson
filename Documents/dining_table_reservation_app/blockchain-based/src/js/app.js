
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',  

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Reservation.json", function(reservation) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Reservation = TruffleContract(reservation);
      // Connect provider to interact with contract
      App.contracts.Reservation.setProvider(App.web3Provider);

      App.listenForEvents();

      App.restaurantSection(); 

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    window.ethereum.on('accountsChanged', function (accounts) {
      // Time to reload your interface with accounts[0]!
      // App.listenForEvents(); 
      App.restaurantSection();

    });
    App.contracts.Reservation.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.addedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        // App.restaurantSection(); 
        App.render();
      });
    });
  },

  render: function(){
    console.log("main function rendered")

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
  },

  restaurantSection: function() {
    var restaurantInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    console.log("Restaurant section rendered");

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Reservation.deployed().then(function(instance) {
      console.log("Inside contract");
      restaurantInstance = instance;
      return restaurantInstance.restaurantsCount();
    }).then(function(restaurantsCount) { 
      console.log("Heu res"); 
      var restaurantResult = $("#restaurantResult");
      restaurantResult.empty();  
      
      k = restaurantInstance.restaurantOwners(App.account).then(
        function(i) {
          console.log(Number(i));
          console.log(Number(restaurantsCount)); 
          var truth = ( Number(i) > 0 && Number(i) == Number(restaurantsCount));
          if ( Number(i) > 0 && Number(i) == Number(restaurantsCount)) {
          
            restaurantInstance.restaurants(Number(i)).then(function(restaurant) {
              var id = restaurant[0];
              var name = restaurant[1];
              var city = restaurant[2];
              var adress = restaurant[3];
              var opensAt = restaurant[4];
              var closesAt = restaurant[5];
              var totalSeats = restaurant[6];
    
              // Render restaurant Result
              var restaurantTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + city + "</td><td>" + adress + "</td><td>" + opensAt + "</td><td>" + closesAt + "</td><td>" + totalSeats + "</td></tr>"
              
              restaurantResult.append(restaurantTemplate); 
    
            });
          } 
          return truth;
        }
      ); 
      return k;
    }).then(function(hasRegistered) {
      alert("Registered"); 
      // Do not allow a user to vote
      if(hasRegistered) {
        $('form').hide();        
      } else {
        $('form').show();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castAddRestaurant: function() {
    var name = $('#rName').val();
    var city = $('#rCity').val();
    var adress = $('#rAddress').val();
    var opensAt = $('#rOpensAt').val();
    var closesAt = $('#rClosesAt').val();
    var totalSeats = Number($('#rTotalSeats').val());
    App.contracts.Reservation.deployed().then(function(instance) {
      acc = String(App.account);
      return instance.contract.addRestaurant(name, city, adress, opensAt, closesAt, totalSeats, {from: acc},
        function(error, result){
          if(!error)
              console.log(result);
          else
              console.error(error);
    });
      // return instance.addRestaurant(name, city, adress, opensAt, closesAt, totalSeats);
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  // userSection: function() {
  //   var restaurantInstance;
  //   var loader = $("#loader");
  //   var content = $("#content");

  //   loader.show();
  //   content.hide();

  //   console.log("User section rendered");

  //   // Load account data
  //   web3.eth.getCoinbase(function(err, account) {
  //     if (err === null) {
  //       App.account = account;
  //       $("#accountAddress").html("Your Account: " + account);
  //     }
  //   });

  //   // Load contract data
  //   App.contracts.Reservation.deployed().then(function(instance) {
  //     console.log("Inside contract");
  //     restaurantInstance = instance;
  //     return restaurantInstance.restaurantsCount();
  //   }).then(function(restaurantsCount) {
  //     var restaurantResult = $("#restaurantResult");
  //     restaurantResult.empty();

  //     i = restaurantInstance.restaurantOwners(App.account)[1];

  //     if (i <= restaurantsCount) {
  //       restaurantInstance.restaurants(i).then(function(restaurant) {
  //         var id = restaurant[0];
  //         var name = restaurant[1];
  //         var city = restaurant[2];
  //         var adress = restaurant[3];
  //         var opensAt = restaurant[4];
  //         var closesAt = restaurant[5];
  //         var totalSeats = restaurant[6];

  //         // Render restaurant Result
  //         var restaurantTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + city + "</td><td>" + adress + "</td><td>" + opensAt + "</td><td>" + closesAt + "</td><td>" + totalSeats + "</td></tr>"
  //         restaurantResult.append(restaurantTemplate);

  //       });
  //     }

  //     return restaurantInstance.restaurantOwners(App.account)[0];
  //   }).then(function(hasRegistered) {
  //     // Do not allow a user to vote
  //     if(hasRegistered) {
  //       $('form').hide();
  //     } 
  //     content.show();
  //     loader.hide();
  //   }).catch(function(error) {
  //     console.warn(error);
  //   });
  // },

  // castBook: function() {
  //   var uname = $('#uName').val();
  //   var uemail = $('#uEmail').val();
  //   var ustartTime = Number($('#uStartTime').val());
  //   var uendTime = Number($('#uEndTime').val());
  //   var uguestCount = Number($('#uGuestCount').val());
  //   var timeLimit = 8;
  //   App.contracts.Reservation.deployed().then(function(instance) {
  //     return instance.book(uname, uemail, timeLimit, ustartTime, uendTime, uguestCount, { from: App.account });
  //   }).then(function(result) {
  //     // Wait for votes to update
  //     $("#content").hide();
  //     $("#loader").show();
  //   }).catch(function(err) {
  //     console.error(err);
  //   });
  // }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});




// castVote: function() {
//   var candidateId = $('#candidatesSelect').val();
//   App.contracts.Election.deployed().then(function(instance) {
//     return instance.vote(candidateId, { from: App.account });
//   }).then(function(result) {
//     // Wait for votes to update
//     $("#content").hide();
//     $("#loader").show();
//   }).catch(function(err) {
//     console.error(err);
//   });
// }



// render: function() {
//   var electionInstance;
//   var loader = $("#loader");
//   var content = $("#content");

//   loader.show();
//   content.hide();

//   // Load account data
//   web3.eth.getCoinbase(function(err, account) {
//     if (err === null) {
//       App.account = account;
//       $("#accountAddress").html("Your Account: " + account);
//     }
//   });

//   // Load contract data
//   App.contracts.Election.deployed().then(function(instance) {
//     electionInstance = instance;
//     return electionInstance.candidatesCount();
//   }).then(function(candidatesCount) {
//     var candidatesResults = $("#candidatesResults");
//     candidatesResults.empty();

//     var candidatesSelect = $('#candidatesSelect');
//     candidatesSelect.empty();

//     for (var i = 1; i <= candidatesCount; i++) {
//       electionInstance.candidates(i).then(function(candidate) {
//         var id = candidate[0];
//         var name = candidate[1];
//         var voteCount = candidate[2];

//         // Render candidate Result
//         var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
//         candidatesResults.append(candidateTemplate);

//         // Render candidate ballot option
//         var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
//         candidatesSelect.append(candidateOption);
//       });
//     }
//     return electionInstance.voters(App.account);
//   }).then(function(hasVoted) {
//     // Do not allow a user to vote
//     if(hasVoted) {
//       $('form').hide();
//     }
//     loader.hide();
//     content.show();
//   }).catch(function(error) {
//     console.warn(error);
//   });
// },