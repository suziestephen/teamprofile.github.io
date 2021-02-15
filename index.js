const fs = require('fs');
const inquirer = require('inquirer');
const Manager = require('./lib/Manager');
const Engineer = require('./lib/Engineer');
const Intern = require('./lib/Intern');
const ManagerProfile = require('./templates/ManagerProfile');
const EngineerProfile = require('./templates/EngineerProfile');
const InternProfile = require('./templates/InternProfile');
const GenerateHTML = require('./utils/generateHTML');

class App {
    constructor() {
        this.db = {
            manager: null,
            engineers: [], // Array of engineer object instances,
            interns: [], // Array of intern object intances
        }
    }

    async getemployeeDetails() {

        console.log(`\nPlease enter employee details:\n`);

        let employeeDetails =
            await inquirer
                .prompt([
                    {
                        type: "input",
                        message: "ID: ",
                        name: "id"
                    },
                    {
                        type: "input",
                        message: "Name: ",
                        name: "name"
                    },
                    {
                        type: "input",
                        message: "Email: ",
                        name: "email"
                    },
                    {
                        type: 'list',
                        message: 'What is your Title?',
                        choices: [
                            "Engineer",
                            "Intern",
                            "Manager"
                        ],
                        name:'title'
                        },
                ]);

        switch (employeeDetails.title.toLowerCase()) {
            case 'manager':
                employeeDetails = await this.getOfficeNumber(employeeDetails);
                break;
            case 'engineer':
                employeeDetails = await this.getGithubHandle(employeeDetails);
                break;
            case 'intern':
                employeeDetails = await this.getSchoolInfo(employeeDetails);
                break;
            default:
                break;

        }

        return employeeDetails;
    }

    async getOfficeNumber(employeeDetails) {
        const managerInfo =
            await inquirer
                .prompt([
                    {
                        type: "input",
                        message: "Office Number: ",
                        name: "officeNumber"
                    }
                ])

        employeeDetails.officeNumber = await managerInfo.officeNumber;

        return employeeDetails;
    }

    async getGithubHandle(employeeDetails) {
        let engineerInfo =
            await inquirer
                .prompt([
                    {
                        type: "input",
                        message: "GitHub handle: ",
                        name: "github"
                    }
                ]);

        employeeDetails.github = await engineerInfo.github;

        return employeeDetails;
    }

    async getSchoolInfo(employeeDetails) {
        let internInfo =
            await inquirer
                .prompt([
                    {
                        type: "input",
                        message: "School: ",
                        name: "school"
                    }
                ]);

        employeeDetails.school = internInfo.school;

        return employeeDetails;
    }

    createEmployee(employeeDetails) {
        let employee;
        const { id, name, email } = employeeDetails;
        switch (employeeDetails.title.toLowerCase()) {
            case 'manager':
                const manager = new Manager(name, id, email, employeeDetails.officeNumber);
                employee = manager;
                break;
            case 'engineer':
                const engineer = new Engineer(name, id, email, employeeDetails.github);
                employee = engineer;
                break;
            case 'intern':
                const intern = new Intern(name, id, email, employeeDetails.school);
                employee = intern;
                break;
            default:
                break;
        }

        return employee;
    }

    saveEmployeeToDb(employee) {
        switch (employee.getRole().toLowerCase()) {
            case 'manager':
                this.db.manager = employee;
                break;
            case 'engineer':
                this.db.engineers.push(employee);
                break;
            case 'intern':
                this.db.interns.push(employee);
                break;
            default:
                break;
        }
    }

    createGenerateHTML() {

        let managerProfile = '';
        let engineers = '';
        let interns = '';

        if (this.db.manager) {
            managerProfile = new ManagerProfile(this.db.manager);
            managerProfile = managerProfile.createProfile();
        }

        if (this.db.engineers) {
            for (const engineer of this.db.engineers) {
                let engineerProfile = new EngineerProfile(engineer);
                engineerProfile = engineerProfile.createProfile();

                engineers += engineerProfile;
            }
        }

        if (this.db.interns) {
            for (const intern of this.db.interns) {
                let internProfile = new InternProfile(intern);
                internProfile = internProfile.createProfile();

                engineers += internProfile;
            }
        }

        const team = managerProfile + engineers + interns;

        let generateHTML = new GenerateHTML(team);
        generateHTML = generateHTML.createGenerateHTML();

        return generateHTML;
    }

    createFile(generateHTML) {

        fs.writeFile('./output/team.html', generateHTML, function (err) {
            if (err) throw err;
            console.log('Saved!');
        });



    }

    async init() {

        let input = '';

        do {

            const employee = this.createEmployee(await this.getemployeeDetails());

            this.saveEmployeeToDb(employee);

            input =
                await inquirer
                    .prompt([
                        {
                            type: "list",
                            message: "Would you like to save this person",
                            choices: [
                                "Yes",
                                "No"
                            ],
                            name: 'addTeam'
                        }
                    ]);

        } while (!input.addTeam);

        const generateHTML = this.createGenerateHTML();

        this.createFile(generateHTML);
    }
}

const app = new App();

app.init();