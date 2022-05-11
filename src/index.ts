import moment, { Moment } from 'moment';
import Papa from 'papaparse';
import fs from 'fs';

export
interface IOHLCV {
  time: Moment;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  source?: number[];
}

export
function log(name: string, text = '') {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss:SSS')} ${name}]${text ? `: ${text}` : '...'}`);
}

export
function load_csv(filePath: string, interval = 60000): IOHLCV[] {
  log('读取csv文件');
  const csvText = fs.readFileSync(filePath, 'utf-8');
  log('解析csv文件');
  const csvData = Papa.parse(csvText, {
    dynamicTyping: true,
    skipEmptyLines: true,
  }).data as number[][];
  log('排序数据');
  csvData.sort((a, b) => a[0] - b[0]);
  log('转换为OHLCV格式');
  const result: IOHLCV[] = [];
  csvData.forEach((item) => {
    result.push({
      time: moment(new Date(item[0])),
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5],
      source: item,
    });
    if (result.length > 1) {
      const curTime = result[result.length - 1].time;
      const prevTime = result[result.length - 2].time;
      const diff = curTime.diff(prevTime, 'milliseconds');
      if (diff !== interval) {
        log('间距不正确', `${
          prevTime.format('YYYY-MM-DD HH:mm:ss:SSS')
        } ~ ${
          curTime.format('YYYY-MM-DD HH:mm:ss:SSS')
        } diff: ${diff}`)
      }
    }
  });
  return result;
}
