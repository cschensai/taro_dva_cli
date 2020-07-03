#! /usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const fs = require('fs');

program
  .version(require('../package.json').version, '-v', '--version')
  .usage('<command> [options]')
  .command('init')
  .description('请输入目录名称')
  .action(async () => {
    const projectName = process.argv[3];
    if (!projectName) {
      console.log(chalk.bgRed('请输入目录名称，如：tdc init test'));
      return false;
    }
    // 检索本地是否存在同名的文件目录
    const currDir = process.cwd();
    const fileList = fs.readdirSync(currDir);
    const isRepeatDir = fileList.find(file => fs.statSync(`${currDir}/${file}`).isDirectory() && file === projectName);
    if (isRepeatDir) {
      console.log(chalk.red(`🙅‍♂️ 存在同名目录 ${projectName}，请重新选择目录.`));
      return false;
    }
    const question = [{
      name: 'isNeedDva',
      type: 'confirm',
      message: '是否需要dva数据流管理',
    }]
    const res = await inquirer.prompt(question);
    let branchName = 'dva_no';
    if (res.isNeedDva) {
      branchName = 'master';
    }
    // 已经输入了目录名
    const spinner = ora(chalk.grey('正在远程拉取模版，客官请稍等...'));
    spinner.start();
    // 远程库
    const url = `https://github.com:cschensai/xcx_taro_dva#${branchName}`;
    // { clone: true }不用加，加了会报128错误
    download(url, projectName, err => {
      if (err) {
        spinner.fail(`${chalk.bgRedBright(`拉取项目失败，原因：${err}`)}`);
        return false;
      }
      spinner.succeed(`${chalk.bgGreen('下载项目已完成')}`);
      const desc = `
        1. cd ${projectName}
        2. npm i or yarn
        3. npm start or yarn start
      `;
      console.log(desc);
    })
  })

// 解析命令行参数
program.parse(process.argv);
