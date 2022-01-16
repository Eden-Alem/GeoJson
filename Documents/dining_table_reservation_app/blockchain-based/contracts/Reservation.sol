pragma solidity >=0.4.22 <0.8.0;


contract Reservation {
    // Model a Restaurant
    struct Restaurant {
        uint id;
        string name;
        string city;
        string adress;
        string opensAt;
        string closesAt;
        uint totalSeats;
        uint guestCount;
    }

    struct User {
        string username;
        string useremail;
        uint timeLimit;
        uint startTime;
        uint endTime;
        uint guestNumber;
    }

    // Store accounts that have booked today
    mapping(address => bool) public users;

    // Store accounts that have registered their restaurants
    mapping(address => uint) public restaurantOwners;

    // Fetch Restaurant
    mapping(uint => Restaurant) public restaurants;
    // Store Restaurants Count
    uint public restaurantsCount;
    // uint256 public datechecker = block.timestamp; 

    // added Restaurant event
    event addedEvent (
        uint indexed _restaurantId
    );

    // added Restaurant event
    event bookedEvent (
        uint indexed _restaurantId
    );

    constructor () public {
        // addRestaurant("Restaurant 1", "Addis Ababa", "Bole Road", "06:00", "20:00", 80);
        // addRestaurant("Restaurant 2", "Addis Ababa", "Belay Zeleke St.", "06:00", "21:00", 120);
        // addRestaurant("Restaurant 3", "Addis Ababa", "Churchill Road", "07:00", "22:00", 40);
        // addRestaurant("Restaurant 4", "Addis Ababa", "Tayitu Road", "07:00", "22:00", 60);
        // addRestaurant("Restaurant 5", "Addis Ababa", "Bole Road", "06:00", "21:00", 75);
    }

    mapping(address => uint) public checking;
    function checker (uint num) public {
        checking[msg.sender] = num;
    }

    mapping(address => string) public schecking;
    function stringChecker (string memory n) public {
        schecking[msg.sender] = n;
    }

    function addRestaurant (string memory _name, string memory _city, string memory _adress, string memory _opensAt, string memory _closesAt, uint _totalSeats) public {
        // require that they haven't registered before
        require(restaurantOwners[msg.sender] > 0 ? restaurantOwners[msg.sender] != restaurantsCount : restaurantOwners[msg.sender] >= 0);
        
        // Register the restaurant's data
        restaurantsCount ++;
        restaurants[restaurantsCount] = Restaurant(restaurantsCount, _name, _city, _adress, _opensAt, _closesAt, _totalSeats, 0);

        // Record that the restaurant owner has registered
        restaurantOwners[msg.sender] = restaurantsCount;

        // trigger restaurant added event
        emit addedEvent(restaurantsCount);
    }

    function stringToTime(string memory s) private returns (uint result) {
        bytes memory b = bytes(s);
        uint i;
        result = 0;
        for (i = 0; i < 2; i++) {
            uint c = uint(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
    }

    uint public opensTime;
    uint public closesTime;

    // bool public you;
    function book (uint _restaurantId, string memory _username, string memory _useremail, uint _timeLimit, uint _startTime, uint _endTime, uint _guestCount) public {
        // require that they haven't booked within 24 hours
        // require(!users[msg.sender]);

        opensTime = stringToTime(restaurants[_restaurantId].opensAt);
        closesTime = stringToTime(restaurants[_restaurantId].closesAt);

        // require that the booked table gets reserved within the time frame of the restaurant's working hours
        require(opensTime <= _startTime && _endTime <= closesTime);

        // require a valid restaurant
        require(_restaurantId > 0 && _restaurantId <= restaurantsCount);
        
        /// require valid guests in a restaurant
        require(_guestCount < restaurants[_restaurantId].totalSeats && _guestCount > 0);

        // record that voter has booked
        // users[msg.sender] = true;

        User(_username, _useremail, _timeLimit, _startTime, _endTime, _guestCount);

        // update restaurant's guest count and totalSeats
        restaurants[_restaurantId].guestCount = _guestCount;
        restaurants[_restaurantId].totalSeats -= restaurants[_restaurantId].guestCount;

        // trigger restaurant added event
        emit bookedEvent(_restaurantId);
    }
}

//  Lets define the rules here:
//  Restaurant owners register their data to be displayed to users
//  Users book:
//      Must book within the working hour of the restaurant
//      Must not book again within 24 hours of boooking at the same restaurant
//      Must provide guest numbers below the number of guests available
//      Must specify the date and time of the booking of the dining table

