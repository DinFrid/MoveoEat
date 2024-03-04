export const wait = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

export const contacts = ['+972543069499','+972548009514','+972526603040'];
