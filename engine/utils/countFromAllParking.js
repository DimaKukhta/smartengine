function getCountOfFreePlacesOfParking(parkings, parkingId) {
    const responseToArray = Object.values(parkings);
    if (responseToArray) {
        const parking = responseToArray.find((element) => element.id === parkingId);
        return parking.free_spaces;
    } 
}

module.exports = getCountOfFreePlacesOfParking;