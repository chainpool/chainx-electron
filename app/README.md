# react Mobx 框架封装应用，配合 Rxjs

### 问题总结

1.mobx 框架导致 componentDidUpdate 生命周期 nextProps 跟 this.props 一致，无法区分，shouldComponentUpdate 的 netprops 也同时因此失灵

2.changeState 必须要调用 this，由于封装的原因，延迟赋予了这个方法

###功能点 1.修复 componentDidUpdate 的前后两次 props 不一致问题，通过封装 diapttch 给每个 oberval 属性增加对应的 prev 属性
2.action 内部的 rxjs 使用区分组件内部的 new Subject 使用
