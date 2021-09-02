import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

interface ICategoryListProps {
  categories: Array<ICommonCategory>,
  selectedCategoryID: string,
  expandedCategoryNodes: Array<string>,
  onCategorySelected: Function
}
let sendSelection: boolean = true,
expandedNodes: Array<string> = [],
ctrlPress: boolean = false;

function handleSelection( props: ICategoryListProps,  nodeId: string )
{
  if ( sendSelection ) {
    if ( nodeId !== "All Items" ) {
      let nodeName: string = findNodeName( nodeId, props.categories[0]);
      props.onCategorySelected(nodeId, nodeName, expandedNodes);
    } else {
      props.onCategorySelected("", "", []);
    }
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
  sendSelection = true;
};

const useStyles = makeStyles({
  treeItem: {
    fontSize: '0.75rem',
  },
});

function CategoryTree( props: ICategoryListProps) {
  const classes = useStyles();
  let handleNodeSelect = ( event: object, nodeId: string) => handleSelection( props, nodeId ),
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
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      defaultExpanded={props.expandedCategoryNodes}
      defaultSelected={props.selectedCategoryID}
      onNodeSelect={handleNodeSelect}
      onNodeToggle={handleNodeToggle}
    >
      {renderTree(selectAll)}
    </TreeView>
    );
}
export default CategoryTree;
