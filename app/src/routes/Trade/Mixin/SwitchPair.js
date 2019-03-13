import { Mixin } from '../../../components';
import { _ } from '@utils';

class SwitchPair extends Mixin {
  componentDidUpdate(prevProps) {
    super.componentDidUpdate(prevProps);
    const {
      location: { search: searchPrev },
    } = prevProps;
    const {
      location: { search },
      model: { dispatch },
    } = this.props;

    if (!_.isEqual(searchPrev, search)) {
      if (!search) {
        dispatch({
          type: 'clearAll',
        });
      }
    }
  }
}

export default SwitchPair;
