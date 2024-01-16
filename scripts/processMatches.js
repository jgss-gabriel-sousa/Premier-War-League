import { matches } from "../data/matches.js"

export function processMatches(){    
    let id = 0;

    matches.forEach(match => {
        const mRank = match.ranking;
        match.numberOfPlayers = match.ranking.length;
        const mNewRank = [];
        
        let parseDate = match.date.split("-");
        let date = new Date(parseDate[2], parseDate[1] - 1, parseDate[0]);
        match.timestamp = date.getTime();

        match.id = id++;
        
        if(match.ranking.length == 2 && 
            match.ranking[0].player2 == undefined && 
            match.ranking[1].player2 == undefined){ //X1
            match.x1 = true;
        }
        if(match.ranking.length == 2 && 
            match.ranking[0].player2 && !match.ranking[0].player3 && 
            match.ranking[1].player2 && !match.ranking[1].player3){

            match.numberOfPlayers = 4;
            match.inTeam = true;
            match.inTeamType = "2 Duplas";
        }
        else if(match.ranking.length == 3 && match.ranking[0].player2 && match.ranking[1].player2 && match.ranking[2].player2 && !match.ranking[0].player3 && !match.ranking[1].player3 && !match.ranking[2].player3){
            match.numberOfPlayers = 6;
            match.inTeam = true;
            match.inTeamType = "3 Duplas";
        }
        else if(match.ranking.length == 2 && match.ranking[0].player3 && match.ranking[1].player3){
            match.numberOfPlayers = 6;
            match.inTeam = true;
            match.inTeamType = "2 Trios";
        }

        let positions = 1;
        for(let i = 0; i < mRank.length; i++){
            const p = mRank[i];

            if(!p.winner)
                p.winner = false;
            else{
                p.position = 1;
                match.winner = p.player1 + (p.player2 != undefined ? " - "+p.player2 : "") + (p.player3 != undefined ? " - "+p.player3 : "");;
            }

            if(i != 0 && p.territories == mRank[i-1].territories && p.troops == mRank[i-1].troops){
                positions--;
            }

            p.position = positions++;

            mNewRank.push(p);
        }

        match.ranking = mNewRank;
    });
    
    console.log(matches)
}