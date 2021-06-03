function getCountOfFreePlacesOfParking(parkings, parkingId) {
    const responseToArray = Object.values(parkings);
    if (responseToArray) {
        const parking = responseToArray.find((element) => element.id === parkingId);
        console.log(parking.free_spaces)
        return parking.free_spaces;
    } 
}

module.exports = getCountOfFreePlacesOfParking;