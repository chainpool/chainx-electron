# react Mobx 框架封装应用，配合 Rxjs

### 问题总结

1.mobx 框架导致 componentDidUpdate 生命周期 nextProps 跟 this.props 一致，无法区分，shouldComponentUpdate 的 netprops 也同时因此失灵

2.changeState 必须要调用 this，由于封装的原因，延迟赋予了这个方法

###功能点 1.修复 componentDidUpdate 的前后两次 props 不一致问题，通过封装 diapttch 给每个 oberval 属性增加对应的 prev 属性
2.action 内部的 rxjs 使用区分组件内部的 new Subject 使用

## 本地 nginx

http {
include mime.types;
default_type application/octet-stream;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;
    gzip  on;
    gzip_comp_level 6;
    gzip_buffers     4 8k;
    gzip_proxied any;
    gzip_min_length  1024;
    gzip_types text/plain text/css application/x-javascript application/javascript application/xml;


    server {
        listen       80;
        server_name  weixiaoyi.com;

        location ^~ /api/  {
            proxy_pass http://127.0.0.1:3000;
        }

        location / {
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header Host $http_host;
           proxy_set_header X-NginX-Proxy true;

           proxy_pass http://127.0.0.1:8000;
           proxy_redirect off;
       }

}
}
