var Reservation = artifacts.require("./Reservation.sol");

module.exports = function(deployer) {
  deployer.deploy(Reservation);
};
