export default function getEntryNumber(playerNumber: number, currentRound: number, totalRounds: number): number {
    let num = playerNumber;

    for (let i = 1; i < currentRound; i++) {
        num--;
        if (num <= 0){
            num = totalRounds;
        }
    }

    return num;
}