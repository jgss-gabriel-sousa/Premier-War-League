export function orderRanking(baseRanking) {
    const playerEntries = Object.entries(baseRanking);

    playerEntries.sort((a, b) => {
        if(a[1].pts){
            
            const pointsPercentageComparison = parseFloat(b[1].pointsPercentage) - parseFloat(a[1].pointsPercentage);
            if (pointsPercentageComparison !== 0) {
                return pointsPercentageComparison;
            }
            /*
            const pointsComparison = b[1].pts - a[1].pts;
            if (pointsComparison !== 0) {
                return pointsComparison;
            }*/
        }
        if(a[1].elo){
            const eloComparison = b[1].elo - a[1].elo;
            if (eloComparison !== 0) {
                return eloComparison;
            }
        }


        const victoriesComparison = b[1].victories - a[1].victories;
        if (victoriesComparison !== 0) {
            return victoriesComparison;
        }

        if(a[1].podiums){
            const podiumsComparison = b[1].podiums - a[1].podiums;
            if (podiumsComparison !== 0) {
                return podiumsComparison;
            }
        }

        if(a[1].matches > 3 || b[1].matches > 3){
            const matchesComparison = b[1].matches - a[1].matches;
            if (matchesComparison !== 0) {
                return matchesComparison;
            }
        }

        return 0;
    });

    const newRank = {};
    let currentPosition = 1;

    for (let i = 0; i < playerEntries.length; i++) {
        const [player, details] = playerEntries[i];

        if (i > 0 && (
            details.elo !== playerEntries[i - 1][1].elo ||
            details.pointsPercentage !== playerEntries[i - 1][1].pointsPercentage ||
            details.victories !== playerEntries[i - 1][1].victories ||
            details.podiums !== playerEntries[i - 1][1].podiums
            )) {
            currentPosition = i + 1;
        }

        newRank[player] = baseRanking[player];
        newRank[player].position = currentPosition;
    }

    return newRank;
}