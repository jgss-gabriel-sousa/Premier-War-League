import { matches } from "../data/matches.js"

export function processMatches(){
    matches.forEach(match => {
        const mRank = match.ranking;
        match.numberOfPlayers = match.ranking.length;
        const mNewRank = [];
        
        let parseDate = match.date.split("-");
        let date = new Date(parseDate[2], parseDate[1] - 1, parseDate[0]);
        match.timestamp = date.getTime();
        
        if(match.ranking.length == 2 && 
            match.ranking[0].player2 == undefined && 
            match.ranking[1].player2 == undefined){ //X1
            match.x1 = true;
        }
        if(match.ranking.length == 2 && 
            match.ranking[0].player2 && !match.ranking[0].player3 && 
            match.ranking[1].player2 && !match.ranking[1].player3){ //2 Duplas

            match.numberOfPlayers = 4;
            match.inTeam = true;
        }
        else if(match.ranking.length == 3 && !match.ranking[0].player3 && !match.ranking[1].player3){ //3 Duplas
            match.numberOfPlayers = 6;
            match.inTeam = true;
        }
        else if(match.ranking.length == 2 && match.ranking[0].player3 && match.ranking[1].player3){ //2 Trios
            match.numberOfPlayers = 6;
            match.inTeam = true;
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

        mNewRank.sort((a,b) => b.positions - a.positions);

        match.ranking = mNewRank;
    });
}