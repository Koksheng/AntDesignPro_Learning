import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
//import type { RequestConfig } from 'umi';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, message } =
        res as unknown as any;
        console.log(res);
      if (!success) {
        const error: any = new Error(message);
        error.name = 'BizError';
        error.data = { message };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      console.log("error handler");
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      console.log(error.name);
      console.log(error);
      if (error.name === 'BizError') {
        message.error(JSON.stringify(error.data.message));
        // const errorInfo: ResponseStructure | undefined = error.info;
        // if (errorInfo) {
        //   const { errorMessage, errorCode } = errorInfo;
        //   switch (errorInfo.showType) {
        //     case ErrorShowType.SILENT:
        //       // do nothing
        //       break;
        //     case ErrorShowType.WARN_MESSAGE:
        //       message.warn(errorMessage);
        //       break;
        //     case ErrorShowType.ERROR_MESSAGE:
        //       message.error(errorMessage);
        //       break;
        //     case ErrorShowType.NOTIFICATION:
        //       notification.open({
        //         description: errorMessage,
        //         message: errorCode,
        //       });
        //       break;
        //     case ErrorShowType.REDIRECT:
        //       // TODO: redirect
        //       break;
        //     default:
        //       message.error(errorMessage);
        //   }
        // }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        //message.error(`Response status:${error.response.status}`);
        message.error(JSON.stringify(error.message));
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }


      // switch (error.name) {
      //   case 'BizError':
      //     if (error?.data?.message) {
      //       message.error({
      //         content: error.data.message,
      //         key: 'process',
      //         duration: 20,
      //       });
      //     } else {
      //       message.error({
      //         content: 'Business Error, please try again.',
      //         key: 'process',
      //         duration: 20,
      //       });
      //     }
      //     break;
      //   case 'ResponseError':
      //     message.error({
      //       content: `${error.response.status} ${error.response.statusText}. Please try again.`,
      //       key: 'process',
      //       duration: 20,
      //     });
      //     break;
      //   case 'TypeError':
      //     message.error({
      //       content: `Network error. Please try again.`,
      //       key: 'process',
      //       duration: 20,
      //     });
      //     break;
      //   default:
      //     break;
      // }
    
      // throw error;
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      // const url = config?.url?.concat('?token = 123');
      const url = config?.url;
      return { ...config, url };
    },
  ],

  // 响应拦截器
  // responseInterceptors: [
  //   (response) => {
  //     // 拦截响应数据，进行个性化处理
  //     const { data } = response as unknown as ResponseStructure;

  //     if (data?.success === false) {
  //       console.log(data);
  //       message.error('请求失败！');
  //     }
  //     return response;
  //   },
  // ],
};
