import React from 'react';
import { Button, Icon, Mixin, Tabs, FormattedMessage } from '../../components';
import * as styles from './index.less';
import NodeTable from './NodeTable';
import UpdateNodeModal from './Modal/UpdateNodeModal';
import VoteModal from './Modal/VoteModal';
import UnFreezeModal from './Modal/UnFreezeModal';
import RegisterNodeModal from './Modal/RegisterNodeModal';
import { Inject } from '../../utils';

@Inject(({ electionStore: model }) => ({ model }))
class Election extends Mixin {
  startInit = async () => {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({ type: 'getIntentions' });
  };

  render() {
    const {
      model: { openModal },
      accountStore: { isValidator, currentAddress },
    } = this.props;
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;

    const tabs = currentAddress
      ? [
          <FormattedMessage id={'ValidatorNode'} />,
          <FormattedMessage id={'StandbyNode'} />,
          <FormattedMessage id={'MyNominations'} />,
        ]
      : [<FormattedMessage id={'ValidatorNode'} />, <FormattedMessage id={'StandbyNode'} />];

    const operations = (
      <ul>
        {isValidator ? (
          <li>
            <Button
              type="blank"
              onClick={() => {
                openModal({
                  name: 'UpdateNodeModal',
                });
              }}>
              <Icon name="icon-xiugaipeizhi" />
              <FormattedMessage id={'UpdateNode'} />
            </Button>
          </li>
        ) : (
          <li>
            <Button
              type="blank"
              onClick={() => {
                openModal({
                  name: 'RegisterNodeModal',
                });
              }}>
              <Icon name="icon-xiugaipeizhi" />
              <FormattedMessage id={'RegisterNode'} />
            </Button>
          </li>
        )}
      </ul>
    );

    return (
      <div className={styles.election}>
        <div className={styles.tabLine}>
          <Tabs tabs={tabs}>
            {activeIndex => (
              <>
                {currentAddress ? operations : null}
                <div className={styles.nodetable}>
                  <NodeTable activeIndex={activeIndex} {...this.props} />
                </div>
              </>
            )}
          </Tabs>
        </div>
        {name === 'UpdateNodeModal' ? <UpdateNodeModal {...this.props} /> : null}
        {name === 'VoteModal' ? <VoteModal {...this.props} /> : null}
        {name === 'UnFreezeModal' ? <UnFreezeModal {...this.props} /> : null}
        {name === 'RegisterNodeModal' ? <RegisterNodeModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Election;
