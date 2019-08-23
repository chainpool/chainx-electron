import React, { Component } from 'react';
import * as styles from './index.less';
import ValidatorCard from './ValidatorCard';
import { ProducerColorChange } from '../components';
import { _, Inject } from '../../utils';

@Inject(({ chainStore }) => ({ chainStore }))
class ActiveValidatorsList extends Component {
  render() {
    const {
      activeIndex,
      sort = {},
      searchName,
      model: {
        openModal,
        allActiveValidator = [],
        allInactiveValidator = [],
        setDefaultPrecision,
        decodeAddressAccountId,
        encodeAddressAccountId,
      },
      accountStore: { currentAccount = {}, currentAddress },
      globalStore: { language },
      chainStore: { currentChainProducer },
    } = this.props;

    const dataSources = [allActiveValidator, allInactiveValidator][activeIndex];
    let dataSourceResult = _.sortBy([...dataSources], ['name'], ['desc']);

    dataSourceResult.sort((a = {}, b = {}) => {
      return b[sort['value']] - a[sort['value']];
      // const aLength = _.get(a, 'isTrustee.length');
      // const bLength = _.get(b, 'isTrustee.length');
      // if (aLength || bLength) {
      //   if (aLength && bLength) {
      //     return b[sort['value']] - a[sort['value']];
      //   } else {
      //     return bLength - aLength;
      //   }
      // } else {
      //   return b[sort['value']] - a[sort['value']];
      // }
    });

    // const rankFromTotalnomination = [...dataSourceResult].sort((item1, item2) => {
    //   return item2.totalNomination - item1.totalNomination;
    // }); // rank 排名按总得票数算

    dataSourceResult = dataSourceResult.map((item, index) => {
      // const findIndex = [...dataSourceResult].findIndex(one => {
      //   return one.account === item.account;
      // });
      return {
        ...item,
        rank: index + 1,
      };
    });

    if (searchName) {
      dataSourceResult = dataSourceResult.filter(item => {
        return new RegExp(searchName, 'i').test(item.name);
      });
    }

    // const groupDataSources = groupArrayByCount(dataSourceResult, 4);

    const validatorCardData = {
      currentAddress,
      currentAccount,
      openModal,
      setDefaultPrecision,
      decodeAddressAccountId,
      language,
      sort,
    };

    const lastLineCount = dataSourceResult.length % 4;
    return (
      <div className={styles.validatorList}>
        {dataSourceResult.map((item, index) => (
          <div
            className={
              index + 1 > 4 * 4 && index + 1 > dataSourceResult.length - 3 * 4 - lastLineCount ? styles.up : null
            }>
            <ProducerColorChange
              showChange={item.isActive}
              Ele={'li'}
              key={index}
              currentChainProducer={currentChainProducer}
              account={encodeAddressAccountId(item.account)}>
              <ValidatorCard item={item} {...validatorCardData} />
            </ProducerColorChange>
          </div>
        ))}
      </div>
    );
  }
}

export default ActiveValidatorsList;
