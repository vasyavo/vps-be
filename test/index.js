const testsModels = [];

const testLoader = () => {
    let normalizedPath = require("path").join(__dirname, "./");

    require("fs").readdirSync(normalizedPath).forEach((file) => {
        if (file.includes('index') || (/(^|\/)\.[^\/\.]/g).test(file)) {
            return;
        }

        const currentTestModel = require(`./${file}`);
        testsModels.push(currentTestModel);
    });
};

class TestsManager {
    constructor() {
        testLoader();
        this.testsModels = testsModels;
    };

    runAllTests() {
        // console.log(this.testsModels);
        this.testsModels.forEach((m, idx) => {
            m.runTests();
        });
    }
}

const testsManager = new TestsManager();
testsManager.runAllTests();