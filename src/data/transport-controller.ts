export class TransportController {
    private dataSources: TransportDataSource[];

    constructor(dataSources: TransportDataSource[]) {
        this.dataSources = dataSources;
    }
};
