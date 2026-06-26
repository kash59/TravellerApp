const getBadge = (points) => {

    if (points >= 250) {
        return "Travel Legend";
    }

    if (points >= 100) {
        return "Travel Expert";
    }

    if (points >= 50) {
        return "Local Guide";
    }

    return "Explorer";
};

module.exports = getBadge;
