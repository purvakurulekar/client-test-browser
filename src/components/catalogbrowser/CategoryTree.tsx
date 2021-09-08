import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import TreeItem from '@material-ui/lab/TreeItem';

interface ICategoryListProps {
  categories: Array<ICommonCategory>,
  selectedCategoryIDs: Array<string>,
  expandedCategoryNodes: Array<string>,
  onCategorySelected: Function
}
let sendSelection: boolean = true,
expandedNodes: Array<string> = [],
ctrlPress: boolean = false,
needsSelection: boolean = false,
nodesToSend: Array<string> = [],
categoryProps: ICategoryListProps;

function handleSelection( props: ICategoryListProps,  nodeIds: Array<string> )
{
  let nodeNames: Array<string> = [];
  if ( sendSelection && ( nodeIds.length > 0 ) ) {
    if ( nodeIds[0] !== "All Items" ) {
      nodeNames = nodeIds.map((id: string) => findNodeName(id, props.categories[0]));
      props.onCategorySelected(nodeIds, nodeNames.join(","), expandedNodes);
    } else {
      props.onCategorySelected("", "", []);
    }
  } else if ( ctrlPress ) {
    nodesToSend = nodeIds;
  }
};

function handleExpansion( nodeIds: Array<string> )
{
  expandedNodes = nodeIds;
};

function findNodeName( nodeId: string, category: ICommonCategory): string
{
  let nodeName: string = "";
  if (category.code === nodeId) {
    nodeName = category.name;
  } else {
    if ( Array.isArray(category.groups)) {
      for (let loop = 0; loop < category.groups?.length; loop++) {
        nodeName = findNodeName( nodeId, category.groups[loop] );
        if ( nodeName !== "" ){
          break;
        }
      }
    }
  }
  return nodeName;
};

const iconSelection = () => {
  sendSelection = false;
}; 

const labelSelection = () => {
  if ( !ctrlPress ) {
    sendSelection = true;
  } else {
    needsSelection = true;
    sendSelection = false;
  }
};

const useStyles = makeStyles({
  treeItem: {
    fontSize: '0.75rem',
  },
});

const CheckCtrlPressed = ( e: KeyboardEvent ) => {
  if ( e.ctrlKey === true ) {
    ctrlPress = true;
  }
};

const CheckNeedsSelection = ( e: KeyboardEvent ) => {
  if ( needsSelection ) {
    ctrlPress = false;
    needsSelection = false;
    sendSelection = true;
    if ( nodesToSend.length > 0 ) {
      handleSelection( categoryProps, nodesToSend );
      nodesToSend = [];
    }
  }
};

function CategoryTree( props: ICategoryListProps) {
  const classes = useStyles();
  window.addEventListener("keydown", (e)=> {
    CheckCtrlPressed(e);
  });
  window.addEventListener("keyup", (e)=> {
    CheckNeedsSelection(e);
  });
  categoryProps = props;
  let handleNodeSelect = ( event: object, nodeIds: Array<string>) => handleSelection( props, nodeIds ),
  handleNodeToggle = ( event: object, nodeIds: Array<string>) => handleExpansion( nodeIds ),
  selectAll: ICommonCategory = {code: "All Items", name: "All Items", groups: props.categories };
  const renderTree = (category: ICommonCategory) => (
    <TreeItem key={category.code} nodeId={category.code} label={category.name} onIconClick={iconSelection}
    onLabelClick={labelSelection} classes={{ label: classes.treeItem }}>
      {Array.isArray(category.groups) ? category.groups.map((node) => renderTree(node)) : null}
    </TreeItem>
    );

  return (
    <TreeView
      className="catalog-categories-tree-list"
      defaultCollapseIcon={<FontAwesomeIcon icon={faCaretDown}/>}
      defaultExpandIcon={<FontAwesomeIcon icon={faCaretRight}/>}
      defaultExpanded={props.expandedCategoryNodes}
      defaultSelected={props.selectedCategoryIDs}
      onNodeSelect={handleNodeSelect}
      onNodeToggle={handleNodeToggle}
      multiSelect={true}
    >
      {renderTree(selectAll)}
    </TreeView>
    );
}
export default CategoryTree;
