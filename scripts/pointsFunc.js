export function pointsFunc(position, totalOfPlayers, playersInTeam){
    let points;
    position--;
    
    if(totalOfPlayers == 6){
        points = [10,8,6,3,2,1];
    }
    else if(totalOfPlayers == 5){
        points = [8,6,3,2,1];
    }
    else if(totalOfPlayers == 4){
        points = [6,3,2,1];
    }
    else if(totalOfPlayers == 3){
        points = [4,2,1];
    }
    else if(totalOfPlayers == 2){
        points = [2,-2];
    }

    if(playersInTeam > 1){
        return Math.max((Math.floor(points[position] / playersInTeam)), 1);
    }

    return points[position];
}