import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser, currentMenu as queryCurrentMenu } from './services/ant-design-pro/api';
import type { ResponseError } from 'umi-request';
import { message } from 'antd';

const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  currentMenu?: MenuDataItem[];
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchMenu?: () => Promise<MenuDataItem[] | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg;
      // return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchMenu = async () => {
    try {
      const currentMenu = await queryCurrentMenu();
      return currentMenu;
    } catch (error) {
      message.error('Get menu data failed.', 10);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (window.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    const currentMenu = await fetchMenu();
    return {
      fetchUserInfo,
      fetchMenu,
      currentUser,
      currentMenu,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    fetchMenu,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    // layoutBgImgList: [
    //   {
    //     src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
    //     left: 85,
    //     bottom: 100,
    //     height: '303px',
    //   },
    //   {
    //     src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
    //     bottom: -68,
    //     right: -45,
    //     height: '303px',
    //   },
    //   {
    //     src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
    //     bottom: 0,
    //     left: 0,
    //     width: '331px',
    //   },
    // ],
    // links: isDev
    //   ? [
    //       <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
    //         <LinkOutlined />
    //         <span>OpenAPI 文档</span>
    //       </Link>,
    //     ]
    //   : [],
    menuHeaderRender: undefined,
    menuDataRender: () => {
      return initialState?.currentMenu || [];
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
// export const request = {
//   ...errorConfig,
// };

const errorHandler = (error: ResponseError) => {
  switch (error.name) {
    case 'BizError':
      if (error.data.message) {
        message.error({
          content: error.data.message,
          key: 'process',
          duration: 20,
        });
      } else {
        message.error({
          content: 'Business Error, please try again.',
          key: 'process',
          duration: 20,
        });
      }
      break;
    case 'ResponseError':
      message.error({
        content: `${error.response.status} ${error.response.statusText}. Please try again.`,
        key: 'process',
        duration: 20,
      });
      break;
    case 'TypeError':
      message.error({
        content: `Network error. Please try again.`,
        key: 'process',
        duration: 20,
      });
      break;
    default:
      break;
  }

  throw error;
};

export const request: RequestConfig = {
  errorHandler,
};