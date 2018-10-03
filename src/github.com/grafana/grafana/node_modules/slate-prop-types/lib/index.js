'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slate = require('slate');

/**
 * Create a prop type checker for Slate objects with `name` and `validate`.
 *
 * @param {String} name
 * @param {Function} validate
 * @return {Function}
 */

function create(name, validate) {
  function check(isRequired, props, propName, componentName, location) {
    var value = props[propName];
    if (value == null && !isRequired) return null;
    if (value == null && isRequired) return new Error('The ' + location + ' `' + propName + '` is marked as required in `' + componentName + '`, but it was not supplied.');
    if (validate(value)) return null;
    return new Error('Invalid ' + location + ' `' + propName + '` supplied to `' + componentName + '`, expected a Slate `' + name + '` but received: ' + value);
  }

  function propType() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return check.apply(undefined, [false].concat(args));
  }

  propType.isRequired = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return check.apply(undefined, [true].concat(args));
  };

  return propType;
}

/**
 * Prop type checkers.
 *
 * @type {Object}
 */

var Types = {
  block: create('Block', function (v) {
    return _slate.Block.isBlock(v);
  }),
  blocks: create('List<Block>', function (v) {
    return _slate.Block.isBlockList(v);
  }),
  change: create('Change', function (v) {
    return _slate.Change.isChange(v);
  }),
  character: create('Character', function (v) {
    return _slate.Character.isCharacter(v);
  }),
  characters: create('List<Character>', function (v) {
    return _slate.Character.isCharacterList(v);
  }),
  data: create('Data', function (v) {
    return _slate.Data.isData(v);
  }),
  document: create('Document', function (v) {
    return _slate.Document.isDocument(v);
  }),
  history: create('History', function (v) {
    return _slate.History.isHistory(v);
  }),
  inline: create('Inline', function (v) {
    return _slate.Inline.isInline(v);
  }),
  inlines: create('Inline', function (v) {
    return _slate.Inline.isInlineList(v);
  }),
  leaf: create('Leaf', function (v) {
    return _slate.Leaf.isLeaf(v);
  }),
  leaves: create('List<Leaf>', function (v) {
    return _slate.Leaf.isLeafList(v);
  }),
  mark: create('Mark', function (v) {
    return _slate.Mark.isMark(v);
  }),
  marks: create('Set<Mark>', function (v) {
    return _slate.Mark.isMarkSet(v);
  }),
  node: create('Node', function (v) {
    return _slate.Node.isNode(v);
  }),
  nodes: create('List<Node>', function (v) {
    return _slate.Node.isNodeList(v);
  }),
  range: create('Range', function (v) {
    return _slate.Range.isRange(v);
  }),
  ranges: create('List<Range>', function (v) {
    return _slate.Range.isRangeList(v);
  }),
  schema: create('Schema', function (v) {
    return _slate.Schema.isSchema(v);
  }),
  stack: create('Stack', function (v) {
    return _slate.Stack.isStack(v);
  }),
  value: create('Value', function (v) {
    return _slate.Value.isValue(v);
  }),
  text: create('Text', function (v) {
    return _slate.Text.isText(v);
  }),
  texts: create('List<Text>', function (v) {
    return _slate.Text.isTextList(v);
  })
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Types;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjcmVhdGUiLCJuYW1lIiwidmFsaWRhdGUiLCJjaGVjayIsImlzUmVxdWlyZWQiLCJwcm9wcyIsInByb3BOYW1lIiwiY29tcG9uZW50TmFtZSIsImxvY2F0aW9uIiwidmFsdWUiLCJFcnJvciIsInByb3BUeXBlIiwiYXJncyIsIlR5cGVzIiwiYmxvY2siLCJpc0Jsb2NrIiwidiIsImJsb2NrcyIsImlzQmxvY2tMaXN0IiwiY2hhbmdlIiwiaXNDaGFuZ2UiLCJjaGFyYWN0ZXIiLCJpc0NoYXJhY3RlciIsImNoYXJhY3RlcnMiLCJpc0NoYXJhY3Rlckxpc3QiLCJkYXRhIiwiaXNEYXRhIiwiZG9jdW1lbnQiLCJpc0RvY3VtZW50IiwiaGlzdG9yeSIsImlzSGlzdG9yeSIsImlubGluZSIsImlzSW5saW5lIiwiaW5saW5lcyIsImlzSW5saW5lTGlzdCIsImxlYWYiLCJpc0xlYWYiLCJsZWF2ZXMiLCJpc0xlYWZMaXN0IiwibWFyayIsImlzTWFyayIsIm1hcmtzIiwiaXNNYXJrU2V0Iiwibm9kZSIsImlzTm9kZSIsIm5vZGVzIiwiaXNOb2RlTGlzdCIsInJhbmdlIiwiaXNSYW5nZSIsInJhbmdlcyIsImlzUmFuZ2VMaXN0Iiwic2NoZW1hIiwiaXNTY2hlbWEiLCJzdGFjayIsImlzU3RhY2siLCJpc1ZhbHVlIiwidGV4dCIsImlzVGV4dCIsInRleHRzIiwiaXNUZXh0TGlzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7O0FBa0JBOzs7Ozs7OztBQVFBLFNBQVNBLE1BQVQsQ0FBZ0JDLElBQWhCLEVBQXNCQyxRQUF0QixFQUFnQztBQUM5QixXQUFTQyxLQUFULENBQWVDLFVBQWYsRUFBMkJDLEtBQTNCLEVBQWtDQyxRQUFsQyxFQUE0Q0MsYUFBNUMsRUFBMkRDLFFBQTNELEVBQXFFO0FBQ25FLFFBQU1DLFFBQVFKLE1BQU1DLFFBQU4sQ0FBZDtBQUNBLFFBQUlHLFNBQVMsSUFBVCxJQUFpQixDQUFDTCxVQUF0QixF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Qlo2QixTQUFPN0MsT0FBTyxZQUFQLEVBQXFCO0FBQUEsV0FBSyxZQUFLOEMsVUFBTCxDQUFnQjlCLENBQWhCLENBQUw7QUFBQSxHQUFyQixDQWhCSztBQWlCWitCLFNBQU8vQyxPQUFPLE9BQVAsRUFBZ0I7QUFBQSxXQUFLLGFBQU1nRCxPQUFOLENBQWNoQyxDQUFkLENBQUw7QUFBQSxHQUFoQixDQWpCSztBQWtCWmlDLFVBQVFqRCxPQUFPLGFBQVAsRUFBc0I7QUFBQSxXQUFLLGFBQU1rRCxXQUFOLENBQWtCbEMsQ0FBbEIsQ0FBTDtBQUFBLEdBQXRCLENBbEJJO0FBbUJabUMsVUFBUW5ELE9BQU8sUUFBUCxFQUFpQjtBQUFBLFdBQUssY0FBT29ELFFBQVAsQ0FBZ0JwQyxDQUFoQixDQUFMO0FBQUEsR0FBakIsQ0FuQkk7QUFvQlpxQyxTQUFPckQsT0FBTyxPQUFQLEVBQWdCO0FBQUEsV0FBSyxhQUFNc0QsT0FBTixDQUFjdEMsQ0FBZCxDQUFMO0FBQUEsR0FBaEIsQ0FwQks7QUFxQlpQLFNBQU9ULE9BQU8sT0FBUCxFQUFnQjtBQUFBLFdBQUssYUFBTXVELE9BQU4sQ0FBY3ZDLENBQWQsQ0FBTDtBQUFBLEdBQWhCLENBckJLO0FBc0Jad0MsUUFBTXhELE9BQU8sTUFBUCxFQUFlO0FBQUEsV0FBSyxZQUFLeUQsTUFBTCxDQUFZekMsQ0FBWixDQUFMO0FBQUEsR0FBZixDQXRCTTtBQXVCWjBDLFNBQU8xRCxPQUFPLFlBQVAsRUFBcUI7QUFBQSxXQUFLLFlBQUsyRCxVQUFMLENBQWdCM0MsQ0FBaEIsQ0FBTDtBQUFBLEdBQXJCO0FBdkJLLENBQWQ7O0FBMEJBOzs7Ozs7a0JBTWVILEsiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7XG4gIEJsb2NrLFxuICBDaGFuZ2UsXG4gIENoYXJhY3RlcixcbiAgRGF0YSxcbiAgRG9jdW1lbnQsXG4gIEhpc3RvcnksXG4gIElubGluZSxcbiAgTGVhZixcbiAgTWFyayxcbiAgTm9kZSxcbiAgUmFuZ2UsXG4gIFNjaGVtYSxcbiAgU3RhY2ssXG4gIFZhbHVlLFxuICBUZXh0LFxufSBmcm9tICdzbGF0ZSdcblxuLyoqXG4gKiBDcmVhdGUgYSBwcm9wIHR5cGUgY2hlY2tlciBmb3IgU2xhdGUgb2JqZWN0cyB3aXRoIGBuYW1lYCBhbmQgYHZhbGlkYXRlYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gdmFsaWRhdGVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZShuYW1lLCB2YWxpZGF0ZSkge1xuICBmdW5jdGlvbiBjaGVjayhpc1JlcXVpcmVkLCBwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uKSB7XG4gICAgY29uc3QgdmFsdWUgPSBwcm9wc1twcm9wTmFtZV1cbiAgICBpZiAodmFsdWUgPT0gbnVsbCAmJiAhaXNSZXF1aXJlZCkgcmV0dXJuIG51bGxcbiAgICBpZiAodmFsdWUgPT0gbnVsbCAmJiBpc1JlcXVpcmVkKSByZXR1cm4gbmV3IEVycm9yKGBUaGUgJHtsb2NhdGlvbn0gXFxgJHtwcm9wTmFtZX1cXGAgaXMgbWFya2VkIGFzIHJlcXVpcmVkIGluIFxcYCR7Y29tcG9uZW50TmFtZX1cXGAsIGJ1dCBpdCB3YXMgbm90IHN1cHBsaWVkLmApXG4gICAgaWYgKHZhbGlkYXRlKHZhbHVlKSkgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gbmV3IEVycm9yKGBJbnZhbGlkICR7bG9jYXRpb259IFxcYCR7cHJvcE5hbWV9XFxgIHN1cHBsaWVkIHRvIFxcYCR7Y29tcG9uZW50TmFtZX1cXGAsIGV4cGVjdGVkIGEgU2xhdGUgXFxgJHtuYW1lfVxcYCBidXQgcmVjZWl2ZWQ6ICR7dmFsdWV9YClcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3BUeXBlKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gY2hlY2soZmFsc2UsIC4uLmFyZ3MpXG4gIH1cblxuICBwcm9wVHlwZS5pc1JlcXVpcmVkID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gY2hlY2sodHJ1ZSwgLi4uYXJncylcbiAgfVxuXG4gIHJldHVybiBwcm9wVHlwZVxufVxuXG4vKipcbiAqIFByb3AgdHlwZSBjaGVja2Vycy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IFR5cGVzID0ge1xuICBibG9jazogY3JlYXRlKCdCbG9jaycsIHYgPT4gQmxvY2suaXNCbG9jayh2KSksXG4gIGJsb2NrczogY3JlYXRlKCdMaXN0PEJsb2NrPicsIHYgPT4gQmxvY2suaXNCbG9ja0xpc3QodikpLFxuICBjaGFuZ2U6IGNyZWF0ZSgnQ2hhbmdlJywgdiA9PiBDaGFuZ2UuaXNDaGFuZ2UodikpLFxuICBjaGFyYWN0ZXI6IGNyZWF0ZSgnQ2hhcmFjdGVyJywgdiA9PiBDaGFyYWN0ZXIuaXNDaGFyYWN0ZXIodikpLFxuICBjaGFyYWN0ZXJzOiBjcmVhdGUoJ0xpc3Q8Q2hhcmFjdGVyPicsIHYgPT4gQ2hhcmFjdGVyLmlzQ2hhcmFjdGVyTGlzdCh2KSksXG4gIGRhdGE6IGNyZWF0ZSgnRGF0YScsIHYgPT4gRGF0YS5pc0RhdGEodikpLFxuICBkb2N1bWVudDogY3JlYXRlKCdEb2N1bWVudCcsIHYgPT4gRG9jdW1lbnQuaXNEb2N1bWVudCh2KSksXG4gIGhpc3Rvcnk6IGNyZWF0ZSgnSGlzdG9yeScsIHYgPT4gSGlzdG9yeS5pc0hpc3RvcnkodikpLFxuICBpbmxpbmU6IGNyZWF0ZSgnSW5saW5lJywgdiA9PiBJbmxpbmUuaXNJbmxpbmUodikpLFxuICBpbmxpbmVzOiBjcmVhdGUoJ0lubGluZScsIHYgPT4gSW5saW5lLmlzSW5saW5lTGlzdCh2KSksXG4gIGxlYWY6IGNyZWF0ZSgnTGVhZicsIHYgPT4gTGVhZi5pc0xlYWYodikpLFxuICBsZWF2ZXM6IGNyZWF0ZSgnTGlzdDxMZWFmPicsIHYgPT4gTGVhZi5pc0xlYWZMaXN0KHYpKSxcbiAgbWFyazogY3JlYXRlKCdNYXJrJywgdiA9PiBNYXJrLmlzTWFyayh2KSksXG4gIG1hcmtzOiBjcmVhdGUoJ1NldDxNYXJrPicsIHYgPT4gTWFyay5pc01hcmtTZXQodikpLFxuICBub2RlOiBjcmVhdGUoJ05vZGUnLCB2ID0+IE5vZGUuaXNOb2RlKHYpKSxcbiAgbm9kZXM6IGNyZWF0ZSgnTGlzdDxOb2RlPicsIHYgPT4gTm9kZS5pc05vZGVMaXN0KHYpKSxcbiAgcmFuZ2U6IGNyZWF0ZSgnUmFuZ2UnLCB2ID0+IFJhbmdlLmlzUmFuZ2UodikpLFxuICByYW5nZXM6IGNyZWF0ZSgnTGlzdDxSYW5nZT4nLCB2ID0+IFJhbmdlLmlzUmFuZ2VMaXN0KHYpKSxcbiAgc2NoZW1hOiBjcmVhdGUoJ1NjaGVtYScsIHYgPT4gU2NoZW1hLmlzU2NoZW1hKHYpKSxcbiAgc3RhY2s6IGNyZWF0ZSgnU3RhY2snLCB2ID0+IFN0YWNrLmlzU3RhY2sodikpLFxuICB2YWx1ZTogY3JlYXRlKCdWYWx1ZScsIHYgPT4gVmFsdWUuaXNWYWx1ZSh2KSksXG4gIHRleHQ6IGNyZWF0ZSgnVGV4dCcsIHYgPT4gVGV4dC5pc1RleHQodikpLFxuICB0ZXh0czogY3JlYXRlKCdMaXN0PFRleHQ+JywgdiA9PiBUZXh0LmlzVGV4dExpc3QodikpLFxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IFR5cGVzXG4iXX0=